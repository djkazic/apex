package org.alopex.apex.net.process;

import org.alopex.apex.db.DB;
import org.alopex.apex.util.Utils;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;

import java.sql.ResultSet;
import java.sql.Statement;
import java.util.UUID;

/**
 * @author Kevin Cai on 7/18/2016.
 */
public class TokenRequest extends ServerResource {

	@Post
	public String process(JsonRepresentation entity) {
		Utils.log(this, "Processing token renewal request");
		this.getResponse().setAccessControlAllowOrigin("*");
		final JSONObject responseJSON = new JSONObject();

		try {
			JSONObject json = entity.getJsonObject();
			if (json.length() > 0) {
				String apiToken = DB.sanitize(json.getString("api_token"));

				Statement stmt = DB.getConnection().createStatement();
				String loginQuery = "SELECT * FROM tokens WHERE token = '" + apiToken + "' AND time >= '"
						+ (System.currentTimeMillis() / 1000) + "'";

				System.out.println(loginQuery);

				ResultSet srs = stmt.executeQuery(loginQuery);
				if (srs.next()) {
					Utils.log(this, "Returning latest token for user [no_expiry]");
					responseJSON.put("token", srs.getString("token"));
				} else {
					loginQuery = "SELECT * FROM tokens WHERE token = '" + apiToken + "'";
					ResultSet frs = stmt.executeQuery(loginQuery);
					if (frs.next()) {
						String gid = frs.getString("gid");
						String futureTimeStamp = "" + ((System.currentTimeMillis() / 1000) + 25);
						Utils.log(this, "Generating new token for user GID [" + gid + "], expiry = [" + futureTimeStamp + "]");
						String generatedToken = UUID.randomUUID().toString();

						String tokenInsertQuery = "INSERT INTO tokens VALUES (NULL, '"
								+ gid + "', '" + generatedToken + "', '" + futureTimeStamp + "')";
						if (stmt.executeUpdate(tokenInsertQuery) >= 0) {
							Utils.log(this, "New token: [" + generatedToken + "]");
							responseJSON.put("token", generatedToken);
						} else {
							Utils.log(this, "Failed to generate new token for user GID [" + gid + "]");
						}
					} else {
						Utils.log(this, "Failed to identify token [" + apiToken + "]");
						responseJSON.put("error", "invalid_token");
					}
				}
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return responseJSON.toString();
	}
}
