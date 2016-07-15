package org.alopex.apex.inject;

import java.io.File;
import java.sql.Statement;
import java.util.ArrayList;

import org.alopex.apex.db.DB;
import org.alopex.apex.util.CSVReader;
import org.alopex.apex.util.Utils;

public class DensityInjector {
	
	public static void main(String[] args) {
		File densityFile = new File("density.csv");
		if (densityFile.exists()) {
			DB.init();
			CSVReader reader = new CSVReader();
			ArrayList<String[]> rows = reader.readCSV(densityFile);
			for (int i=1; i < rows.size(); i++) {
				String[] row = rows.get(i);
				try {
					if (row.length > 0) {
						Statement stmt = DB.getConnection().createStatement();
						
						String zip = String.format("%05d", Integer.parseInt(row[0]));
						String density = row[3];
						
						Utils.log("DensityInjector", "Inserting " + zip + " ==> " + density);
						String insertQuery = "INSERT INTO densities VALUES (NULL, '" + zip + "', '" + density + "')";
						if (stmt.executeUpdate(insertQuery) >= 0) {
							Utils.log("DensityInjector", "\tDensity insertion [PASS]");
						}
					}
				} catch (Exception ex) {
					ex.printStackTrace();
				}
			}
		} else {
			Utils.log("DensityInjector", "Density input file not found");
		}
	}

}
