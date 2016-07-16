package org.alopex.apex.net.process;

import java.sql.ResultSet;
import java.sql.Statement;

import org.alopex.apex.db.DB;
import org.alopex.apex.util.Utils;
import org.json.JSONObject;
import org.restlet.ext.json.JsonRepresentation;
import org.restlet.resource.Post;
import org.restlet.resource.ServerResource;

public class Hardpoint extends ServerResource {

	@Post
	public String process(JsonRepresentation entity) {
		Utils.log(this, "Processing hardpoint request");
		this.getResponse().setAccessControlAllowOrigin("*");
		final JSONObject responseJSON = new JSONObject();
		
		try {
			JSONObject json = entity.getJsonObject();
			if (json.length() > 0) {
				//TODO: DEBUG: send in user ID or token for production
				String userID = "1";

				String lat = DB.sanitize("" + json.getDouble("lat"));
				String lng = DB.sanitize("" + json.getDouble("lng"));
				
				Statement stmt = DB.getConnection().createStatement();

				String checkQuery = "SELECT * FROM locations WHERE id = '" + userID + "'";
				try {
					ResultSet rs = stmt.executeQuery(checkQuery);
					if (rs.next()) {
						String userLat = "" + rs.getBigDecimal("lat").doubleValue();
						String userLng = "" + rs.getBigDecimal("lng").doubleValue();

						// Verify hardpoint
						String query = "SELECT * FROM hardpoints WHERE lat = '" + lat + "' AND lng = '" + lng + "'";
						try {
							ResultSet irs = stmt.executeQuery(query);
							if (irs.next()) {
								// Post distance grab
								if (Utils.latLngDistance(userLat, userLng, lat, lng) <= 40) {

								} else {
									responseJSON.put("error", "Hardpoint distance is higher than limit");
								}
							} else {
								responseJSON.put("error", "No such hardpoint exists at " + lat + ", " + lng);
							}
						} catch (Exception ex) {
							ex.printStackTrace();
						}
					} else {
						responseJSON.put("error", "No locations for " + userID + " found");
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
