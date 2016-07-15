package org.alopex.apex.net.process;

import java.sql.ResultSet;
import java.sql.Statement;

import org.alopex.apex.db.DB;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;

public class Hardpoint extends ServerResource {

	@Post("application/text")
	public String process(JsonRepresentation entity) {
		this.getResponse().setAccessControlAllowOrigin("*");
		final JSONObject responseJSON = new JSONObject();
		try {
			JSONObject json = entity.getJsonObject();
			if (json.length() > 0) {
				String lat = json.getString("lat");
				String lon = json.getString("lon");
				
				lat = String.format("%9.6f", Double.parseDouble(lat));
				lon = String.format("%9.6f", Double.parseDouble(lon));
				
				Statement stmt = DB.getConnection().createStatement();
				String query = "SELECT * FROM hardpoints WHERE lat = '" + lat + "' AND lng = '" + lon + "'";
				try {
					ResultSet rs = stmt.executeQuery(query);
					if (rs.next()) {
						responseJSON.put("name", rs.getString("name"));
						responseJSON.put("stability", rs.getInt("stability"));
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
