package org.alopex.apex;

import org.alopex.apex.db.DB;
import org.alopex.apex.net.api.APIRouter;
import org.alopex.apex.util.Utils;

public class Apex {
	
	public static void main(String[] args) {
		Utils.log("Core", "Opening connection to database...");
		DB.init();
		
		Utils.log("Core", "Initializing API endpoints...");
		APIRouter.init();
	}
}
