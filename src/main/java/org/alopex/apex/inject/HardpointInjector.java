package org.alopex.apex.inject;

import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;

import org.alopex.apex.db.DB;
import org.alopex.apex.util.APISettings;
import org.alopex.apex.util.Utils;

import se.walkercrou.places.GooglePlaces;
import se.walkercrou.places.Place;

public class HardpointInjector {
	
	private static GooglePlaces client;
	
	public static void main(String[] args) {
		// DEBUG
		args = new String[] {"Merritt Island farms"};
		
		if (args.length == 0) {
			Utils.log("HardpointInjector", "No parameters specified, exiting...");
			return;
		}
		
		String searchQuery = args[0];
		client = new GooglePlaces(APISettings.placesApiKey);
		Utils.log("HardpointInjector", "Hardpoint search running on [" + searchQuery + "]");
		List<Place> places = client.getPlacesByQuery(searchQuery, 40);
		Utils.log("HardpointInjector", "\tFound " + places.size() + " result(s)");
		
		if (places.size() > 0) {
			Utils.log("HardpointInjector", "\tListing locations:");
			Utils.log("HardpointInjector", "\tInitializing DB connection...");
			DB.init();
			
			for (Place place : places) {
				System.out.println();
				String address = DB.sanitize(place.getAddress());
				
				Utils.log("HardpointInjector", "Evaluating [" + address + "]");
				
				String[] commaSplit = address.split(",");
				
				if (commaSplit != null && commaSplit.length > 2) {
					String[] spaceSplit = commaSplit[0].split(" ");
					if (spaceSplit != null && spaceSplit.length > 1) {
						if (!address.equals("United States")) {
							// Check for ZIP code presence / format
							boolean foundZip = false;
							String cont = "";
							String[] words = address.split(" ");
							
							for (String piece : words) {
								String replPiece = piece.replaceAll(",", "");
								try {
									if (replPiece.length() == 5) {
										foundZip = true;
										Integer.parseInt(replPiece);
										cont = replPiece;
										
										// Attempt lookup of population density
										try {
											String zip = cont;
											Utils.log("HardpointInjector", "\tAttempting lookup of [" + zip + "]");
											
											Statement stmt = DB.getConnection().createStatement();
											String checkQuery = "SELECT * FROM densities WHERE zip = '" + zip + "'";
											ResultSet rs = stmt.executeQuery(checkQuery);
											
											if (rs.next()) {
												String name = DB.sanitize(place.getName());
												
												if (name.contains("-")) {
													String[] nameDashSplit = name.split("-");
													if (nameDashSplit.length > 0) {
														name = nameDashSplit[0];
													}
												}
												
												String density = rs.getString("density");
												Utils.log("HardpointInjector", "Density data found for [" + name + "] at [" + zip + "] ==> " + density);
												
												String insertQuery = "INSERT INTO hardpoints VALUES (NULL, '" 
																	 + name + "', '" 
														             + density + "', '" 
																	 + place.getLatitude() + "', '" 
														             + place.getLongitude() + "')";
												
												if (stmt.executeUpdate(insertQuery) >= 0) {
													Utils.log("HardpointInjector", "Hardpoint [" + name + "] injection [PASS]");
												} else {
													Utils.log("HardpointInjector", "Hardpoint [" + name + "] injection [FAIL]");					
												}
											} else {
												Utils.log("HardpointInjector", "\t[FAIL] at stage [5/5]");
											}
										} catch (Exception ex) {
											ex.printStackTrace();
										}
									}
								} catch (Exception ex) { }
							}
							
							if (!foundZip) {
								Utils.log("HardpointInjector", "\t[FAIL] at stage [4/5]");
							}
						} else {
							Utils.log("HardpointInjector", "\t[FAIL] at stage [3/5]");
						}
					} else {
						Utils.log("HardpointInjector", "\t[FAIL] at stage [2/5]");
					}
				} else {
					Utils.log("HardpointInjector", "\t[FAIL] at stage [1/5]");
				}
			}
		}
	}
}
