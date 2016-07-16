package org.alopex.apex.util;

public class Utils {

	public static void log(Object clazz, String msg) {
		System.out.println("[" + clazz.getClass().getSimpleName() + "]: " + msg);
	}
	
	public static void log(String clazz, String msg) {
		System.out.println("[" + clazz + "]: " + msg);
	}

	public static double latLngDistance(String slat1, String slon1, String slat2, String slon2) {
		double lat1 = Double.parseDouble(slat1);
		double lon1 = Double.parseDouble(slon1);
		double lat2 = Double.parseDouble(slat2);
		double lon2 = Double.parseDouble(slon2);

		return latLngDistance(lat1, lon1, lat2, lon2);
	}

	public static double latLngDistance(double lat1, double lon1, double lat2, double lon2) {
		double R = 6378.137; // Radius of earth in KM
		double dLat = (lat2 - lat1) * Math.PI / 180;
		double dLon = (lon2 - lon1) * Math.PI / 180;
		double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
				Math.cos(lat1 * Math.PI / 180) *
						Math.cos(lat2 * Math.PI / 180) *
						Math.sin(dLon/2) * Math.sin(dLon/2);
		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		double d = R * c;
		return d * 1000; // meters
	}
}
