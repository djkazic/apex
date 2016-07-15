package org.alopex.apex.util;

public class Utils {

	public static void log(Object clazz, String msg) {
		System.out.println("[" + clazz.getClass().getSimpleName() + "]: " + msg);
	}
	
	public static void log(String clazz, String msg) {
		System.out.println("[" + clazz + "]: " + msg);
	}
}
