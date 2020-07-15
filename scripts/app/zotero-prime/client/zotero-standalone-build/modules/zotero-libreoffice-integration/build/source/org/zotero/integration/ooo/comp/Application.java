/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright (c) 2017  Zotero
						Center for History and New Media
						George Mason University, Fairfax, Virginia, USA
						http://zotero.org
	
	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.
	
	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU Affero General Public License for more details.
	
	You should have received a copy of the GNU Affero General Public License
	along with Zotero.  If not, see <http://www.gnu.org/licenses/>.
	
	***** END LICENSE BLOCK *****
*/

package org.zotero.integration.ooo.comp;

import java.util.HashMap;

import com.sun.star.beans.PropertyValue;
import com.sun.star.container.XNameAccess;
import com.sun.star.frame.XDesktop;
import com.sun.star.lang.XMultiServiceFactory;
import com.sun.star.uno.UnoRuntime;
import com.sun.star.uno.XComponentContext;

public class Application {
	static XMultiServiceFactory factory;
	static XDesktop desktop;
	static String ooName;
	static String ooVersion;
	static XComponentContext ctx;
	static SaveEventListener saveEventListener;
	private static HashMap <Integer, Document> documents = new HashMap<Integer, Document>();
	private static int lastDocumentID = 0;

	public Application(XComponentContext aCtx) throws Exception {
		ctx = aCtx;
		if(desktop == null) init();
	}
	
	public Document getActiveDocument() throws Exception {
		return getDocument(getActiveDocumentID());
	}

	public int getActiveDocumentID() throws Exception {
		if(lastDocumentID == Integer.MAX_VALUE) lastDocumentID = 0;
		Integer documentID = ++lastDocumentID;
		Document document;
		try {
			document = new Document(this, documentID);
		} catch(Exception e) {
			init();
			document = new Document(this, documentID);
		}
		documents.put(documentID, document);
		return documentID;
	}
	
	public Document getDocument(int documentID) {
		return documents.get(documentID);
	}
	
	public void documentComplete(int documentID) {
		documents.remove(documentID);
	}
	
	private void init() throws Exception {
		// get factory and desktop
		factory = (XMultiServiceFactory) UnoRuntime.queryInterface(XMultiServiceFactory.class, ctx.getServiceManager());
		desktop = (XDesktop) UnoRuntime.queryInterface(XDesktop.class, 
				factory.createInstance("com.sun.star.frame.Desktop"));
		
		// get ooName
		XMultiServiceFactory configProvider = (XMultiServiceFactory) UnoRuntime.queryInterface(XMultiServiceFactory.class,
				factory.createInstance("com.sun.star.configuration.ConfigurationProvider"));
		PropertyValue nodepath = new PropertyValue();
		nodepath.Name = "nodepath";
		nodepath.Value = "/org.openoffice.Setup/Product";
		XNameAccess settings = (XNameAccess) UnoRuntime.queryInterface(XNameAccess.class,
				configProvider.createInstanceWithArguments(
						"com.sun.star.configuration.ConfigurationAccess", new Object[] {nodepath}));
		ooName = (String) settings.getByName("ooName");
		ooVersion = (String) settings.getByName("ooSetupVersion");
		
		// create event listener if necessary
		if(saveEventListener == null) saveEventListener = new SaveEventListener();
	}
}