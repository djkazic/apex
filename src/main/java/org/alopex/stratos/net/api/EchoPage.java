package org.alopex.stratos.net.api;

import org.restlet.resource.Get;
import org.restlet.resource.ServerResource;

public class EchoPage extends ServerResource {
	
	@Get
	public String process() {
		return "Stratos API v1.0";
	}
}
