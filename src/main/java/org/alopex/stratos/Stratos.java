package org.alopex.stratos;

import org.alopex.stratos.db.DB;
import org.alopex.stratos.net.api.APIRouter;
import org.alopex.stratos.util.Utils;

public class Stratos {
	
	public static void main(String[] args) {
		Utils.log("Core", "Opening connection to database...");
		DB.init();
		
		Utils.log("Core", "Initializing API endpoints...");
		APIRouter.init();
	}
}
