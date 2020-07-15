/*
	***** BEGIN LICENSE BLOCK *****
	
	Copyright © 2014 Center for History and New Media
					 George Mason University, Fairfax, Virginia, USA
					 http://zotero.org
	
	This file is part of Zotero.
	
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

Zotero.API = {
	parseParams: function (params) {
		if (params.groupID) {
			params.libraryID = Zotero.Groups.getLibraryIDFromGroupID(params.groupID);
		}
		
		if (typeof params.itemKey == 'string') {
			params.itemKey = params.itemKey.split(',');
		}
	},
	
	
	/**
	 * @return {(Zotero.Collection|Zotero.Item)[]}
	 */
	getResultsFromParams: Zotero.Promise.coroutine(function* (params) {
		if (!params.objectType) {
			throw new Error("objectType not specified");
		}
		
		var results;
		
		if (params.objectType == 'collection') {
			let col = Zotero.Collections.getByLibraryAndKey(params.libraryID, params.objectKey);
			if (col) {
				results = [col];
			}
		}
		else if (params.objectType == 'item') {
			switch (params.scopeObject) {
				case 'collections':
					if (params.scopeObjectKey) {
						var col = Zotero.Collections.getByLibraryAndKey(
							params.libraryID, params.scopeObjectKey
						);
					}
					else {
						var col = Zotero.Collections.get(params.scopeObjectID);
					}
					if (!col) {
						throw new Error('Invalid collection ID or key');
					}
					results = col.getChildItems();
					break;
				
				case 'searches':
					if (params.scopeObjectKey) {
						var s = Zotero.Searches.getByLibraryAndKey(
							params.libraryID, params.scopeObjectKey
						);
					}
					else {
						var s = Zotero.Searches.get(params.scopeObjectID);
					}
					if (!s) {
						throw new Error('Invalid search ID or key');
					}
					
					// FIXME: Hack to exclude group libraries for now
					var s2 = new Zotero.Search();
					s2.setScope(s);
					var groups = Zotero.Groups.getAll();
					for (let group of groups) {
						s2.addCondition('libraryID', 'isNot', group.libraryID);
					}
					var ids = yield s2.search();
					break;
				
				default:
					if (params.scopeObject) {
						throw new Error("Invalid scope object '" + params.scopeObject + "'");
					}
					
					var s = new Zotero.Search;
					if (params.libraryID !== undefined) {
						s.addCondition('libraryID', 'is', params.libraryID);
					}
					
					if (params.objectKey) {
						s.addCondition('key', 'is', params.objectKey);
					}
					else if (params.objectID) {
						s.addCondition('itemID', 'is', params.objectID);
					}
					
					if (params.itemKey) {
						for (let i=0; i<params.itemKey.length; i++) {
							let itemKey = params.itemKey[i];
							s.addCondition('key', 'is', itemKey);
						}
					}
					
					// Display all top-level items
					/*if (params.onlyTopLevel) {
						s.addCondition('noChildren', 'true');
					}*/
					
					var ids = yield s.search();
			}
			
			if (results) {
				// Filter results by item key
				if (params.itemKey) {
					results = results.filter(function (result) {
						return params.itemKey.indexOf(result.key) !== -1;
					});
				}
			}
			else if (ids) {
				// Filter results by item key
				if (params.itemKey) {
					ids = ids.filter(function (id) {
						var {libraryID, key} = Zotero.Items.getLibraryAndKeyFromID(id);
						return params.itemKey.indexOf(key) !== -1;
					});
				}
				results = yield Zotero.Items.getAsync(ids);
			}
		}
		else {
			throw new Error("Unsupported object type '" + params.objectType + "'");
		}
		
		return results;
	}),
	
	
	getLibraryPrefix: function (libraryID) {
		var type = Zotero.Libraries.get(libraryID).libraryType;
		switch (type) {
		case 'user':
			return 'library';
		
		case 'publications':
			return 'publications';
		
		case 'group':
			return 'groups/' + Zotero.Groups.getGroupIDFromLibraryID(libraryID);
		
		default:
			throw new Error(`Invalid type '${type}'`);
		}
	}
};

Zotero.API.Data = {
	/**
	 * Parse a relative URI path and return parameters for the request
	 */
	parsePath: function (path) {
		var userLibraryID = Zotero.Libraries.userLibraryID;
		var params = {};
		var router = new Zotero.Router(params);
		
		// Top-level objects
		router.add('library/:controller/top', function () {
			params.libraryID = userLibraryID;
			params.subset = 'top';
		});
		router.add('groups/:groupID/:controller/top', function () {
			params.subset = 'top';
		});
		
		router.add('library/:scopeObject/:scopeObjectKey/items/:objectKey/:subset', function () {
			params.libraryID = userLibraryID;
			params.controller = 'items';
		});
		router.add('groups/:groupID/:scopeObject/:scopeObjectKey/items/:objectKey/:subset', function () {
			params.controller = 'items';
		});
		
		// All objects
		router.add('library/:controller', function () {
			params.libraryID = userLibraryID;
		});
		router.add('groups/:groupID/:controller', function () {});
		
		var parsed = router.run(path);
		if (!parsed || !params.controller) {
			throw new Zotero.Router.InvalidPathException(path);
		}
		
		if (params.groupID) {
			params.libraryID = Zotero.Groups.getLibraryIDFromGroupID(params.groupID);
		}
		Zotero.Router.Utilities.convertControllerToObjectType(params);
		
		return params;
	},
	
	
	getGenerator: function (path) {
		var params = this.parsePath(path);
		//Zotero.debug(params);
		
		return Zotero.DataObjectUtilities.getObjectsClassForObjectType(params.objectType)
			.apiDataGenerator(params);
	}
};




