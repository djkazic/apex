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
		
		try {
			JSONObject json = entity.getJsonObject();
			if (json.length() > 0) {
				String userLat = "" + json.getDouble("user_lat");
				String userLng = "" + json.getDouble("user_lng");
						
				//TODO: log user update		
				
				String fetchQuery = "SELECT id, name, lat, lng, POW(69.1 * (`lat` - "
									+ userLat 
									+ "), 2) + POW(69.1 * ("
									+ userLng 
									+ " - `lng`) * COS(`lat` / 57.3), 2) AS distance FROM hardpoints HAVING distance <= 1 ORDER BY distance";
				
				Statement stmt = DB.getConnection().createStatement();
				ResultSet rs = stmt.executeQuery(fetchQuery);

				int counter = 0;
				JSONArray outArr = new JSONArray();
				while (rs.next()) {
					Utils.log(this, rs.getString("name"));
					JSONObject rowOutput = new JSONObject();
					rowOutput.put("id", rs.getInt("id"));
					rowOutput.put("name", rs.getString("name"));
					rowOutput.put("lat", rs.getFloat("lat"));
					rowOutput.put("lng", rs.getFloat("lng"));

					outArr.put(counter, rowOutput);
					counter++;
				}
				responseJSON.put("value", outArr);
			}
		} catch (Exception ex) {
			ex.printStackTrace();
		}
		return responseJSON.toString();
	}
}
