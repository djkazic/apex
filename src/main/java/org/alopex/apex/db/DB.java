package org.alopex.apex.db;

import java.sql.Connection;
import java.sql.DriverManager;

public class DB {
	
	private static Connection conn;
	
	public static void init() {
		try {
			Class.forName("com.mysql.jdbc.Driver").newInstance();
			conn = DriverManager.getConnection(
					  "jdbc:mysql://" + DBSettings.HOST + "/apex", 
					  DBSettings.USER, 
				      DBSettings.PASS
				   );
		} catch (Exception ex) {
			ex.printStackTrace();
		}
	}
	
	public static String sanitize(String str) {
		return str.replaceAll("'","''");
	}
	
	public static Connection getConnection() {
		return conn;
	}
}
