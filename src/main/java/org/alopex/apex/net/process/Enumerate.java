package org.alopex.apex.net.process;

import java.sql.ResultSet;
import java.sql.Statement;

import org.alopex.apex.db.DB;
import org.alopex.apex.util.Utils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;

public class Enumerate extends ServerResource {
	
	@Post
	public String process(JsonRepresentation entity) {
		Utils.log(this, "Processing enumerate request");
		this.getResponse().setAccessControlAllowOrigin("*");
		final JSONObject responseJSON = new JSONObject();
		String apiToken;
		
		try {
			JSONObject json = entity.getJsonObject();
			if (json.length() > 0) {
				String userLat = DB.sanitize("" + json.getDouble("user_lat"));
				String userLng = DB.sanitize("" + json.getDouble("user_lng"));
				apiToken = DB.sanitize("" + json.getString("api_token"));

				Statement stmt = DB.getConnection().createStatement();

				String getQuery = "SELECT * FROM tokens WHERE token = '" + apiToken + "' AND time >= '"
						          + (System.currentTimeMillis() / 1000) + "'";

				ResultSet gs = stmt.executeQuery(getQuery);
				if (gs.next()) {
					System.out.println(gs.getInt("time"));
					String userID = gs.getString("gid");

					// User location logging pre-check
					String checkQuery = "SELECT * FROM locations WHERE player_id = '" + userID + "'";
					ResultSet rs = stmt.executeQuery(checkQuery);

					String lastLat = "";
					String lastLng = "";
					if (rs.next()) {
						lastLat = "" + rs.getBigDecimal("lat").doubleValue();
						lastLng = "" + rs.getBigDecimal("lng").doubleValue();
					}

					// User location logging
					if (!userLat.equals(lastLat) || !userLng.equals(lastLng)) {
						String storeQuery = "INSERT INTO locations VALUES (NULL, '" + userID + "', '" + userLat + "', '" + userLng + "', '" + System.currentTimeMillis() + "')";
						if (stmt.executeUpdate(storeQuery) >= 0) {
							responseJSON.put("info", "Requests nominal");
						} else {
							responseJSON.put("error", "Failure to log user location");
						}
					} else {
						responseJSON.put("info", "Requests made too quickly");
					}

					// Hardpoint return
					String fetchQuery = "SELECT id, name, lat, lng, POW(69.1 * (`lat` - "
							+ userLat
							+ "), 2) + POW(69.1 * ("
							+ userLng
							+ " - `lng`) * COS(`lat` / 57.3), 2) AS distance FROM hardpoints HAVING distance <= 0.024 ORDER BY distance";

					ResultSet srs = stmt.executeQuery(fetchQuery);

					int counter = 0;
					JSONArray outArr = new JSONArray();
					while (srs.next()) {
						JSONObject rowOutput = new JSONObject();
						rowOutput.put("id", srs.getInt("id"));
						rowOutput.put("name", srs.getString("name"));
						rowOutput.put("lat", srs.getBigDecimal("lat").doubleValue());
						rowOutput.put("lng", srs.getBigDecimal("lng").doubleValue());

						outArr.put(counter, rowOutput);
						counter++;
					}
					responseJSON.put("value", outArr);
				} else {
					Utils.log(this, "Token expiry for [" + apiToken + "]");
					responseJSON.put("token_expired", "true");
				}
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return responseJSON.toString();
	}
}
