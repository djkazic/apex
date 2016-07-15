package org.alopex.apex.util;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.ArrayList;

public class CSVReader {

    public ArrayList<String[]> readCSV(File file) {
        ArrayList<String[]> lineArr = new ArrayList<String[]> ();
        try {
            BufferedReader br = new BufferedReader(new FileReader(file));
            String line;
            String[] split;
            while ((line = br.readLine()) != null) {
                split = line.split(",");
                lineArr.add(split);
            }
            br.close();
        } catch (Exception ex) {
            ex.printStackTrace();
        }
        return lineArr;
    }
}
