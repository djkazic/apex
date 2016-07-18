package org.alopex.apex.net.process;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.alopex.apex.db.DB;
import org.alopex.apex.util.APISettings;
import org.alopex.apex.util.Utils;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;

import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Arrays;
import java.util.UUID;

/**
 * @author Kevin Cai on 7/17/2016.
 */
public class Auth extends ServerResource {

	@Post
	public String process(JsonRepresentation entity) {
		Utils.log(this, "Processing auth request");
		this.getResponse().setAccessControlAllowOrigin("*");
		final JSONObject responseJSON = new JSONObject();

		try {
			JSONObject json = entity.getJsonObject();
			if (json.length() > 0) {
				String googleToken = DB.sanitize(json.getString("token"));

				// Validate token
				try {
					GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(GoogleNetHttpTransport.newTrustedTransport(),
							JacksonFactory.getDefaultInstance())
							.setAudience(Arrays.asList(new String[] {APISettings.CLIENT_ID}))
							.setIssuer("accounts.google.com")
							.build();

					GoogleIdToken idToken = verifier.verify(googleToken);
					if (idToken != null) {
						GoogleIdToken.Payload payload = idToken.getPayload();

						// Print user identifier
						String userId = payload.getSubject();

						// Process registration or login fork
						boolean register = false;

						Statement stmt = DB.getConnection().createStatement();
						String checkQuery = "SELECT * FROM players WHERE gid = '" + userId + "'";
						ResultSet rs = stmt.executeQuery(checkQuery);
						register = (!rs.next());

						if (register) {
							Utils.log(this, "Registering user [" + userId + "]");

							// Get profile information from payload
							String pictureUrl = (String) payload.get("picture");
							String name = (String) payload.get("name");
							String email = payload.getEmail();

							// Registration insert logic
							String insertQuery = "INSERT INTO players VALUES (NULL, '" + name + "', '" + pictureUrl + "', '" + email + "', '" + userId + "')";
							if (stmt.executeUpdate(insertQuery) >= 0) {
								Utils.log(this, "Registered user [" + userId + "] successfully");
								responseJSON.put("token", "registration");
							}
							//
						} else {
							Utils.log(this, "Processing token for user [" + userId + "]");

							// Process login logic here (more DB)
							String loginQuery = "SELECT * FROM tokens WHERE gid = '" + userId + "' AND time >= '"
												+ (System.currentTimeMillis() / 1000) + "'";

							ResultSet srs = stmt.executeQuery(loginQuery);
							if (srs.next()) {
								Utils.log(this, "Fetching latest token for user [" + userId + "]");
								responseJSON.put("token", srs.getString("token"));
							} else {
								String futureTimeStamp = "" + ((System.currentTimeMillis() / 1000) + 25);
								Utils.log(this, "Generating new token for user [" + userId + "], expiry = [" + futureTimeStamp + "]");
								String generatedToken = UUID.randomUUID().toString();

								String tokenInsertQuery = "INSERT INTO tokens VALUES (NULL, '"
														  + userId + "', '" + generatedToken + "', '" + futureTimeStamp + "')";
								if (stmt.executeUpdate(tokenInsertQuery) >= 0) {
									responseJSON.put("token", generatedToken);
								} else {
									Utils.log(this, "Failed to generate new token for user [" + userId + "]");
								}
							}
						}
					} else {
						responseJSON.put("error", "Invalid token");
					}
				} catch (Exception ex) {
					ex.printStackTrace();
				}
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return responseJSON.toString();
	}
}
