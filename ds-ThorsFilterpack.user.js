// ==UserScript==
// @name		DS ThorsFilterPack
// @namespace		ds-thor
// @description		Erzeugt ein paar Filter in den Übersichten ==> PA only
// @include		http://de*.die-staemme.de/game.php?*&mode=units*
// @include		http://de*.die-staemme.de/game.php?*&mode=buildings*
// @include		http://de*.die-staemme.de/game.php?*&mode=combined*
// @include		http://de*.die-staemme.de/game.php?*&screen=place&try=confirm*
// @include		http://de*.die-staemme.de/game.php?*&screen=train&mode=mass*
// @version		0.9.8.7
// ==/UserScript==

//#############################################################################
//# This program is free software; you can redistribute it and/or modify
//# it under the terms of the GNU General Public License as published by
//# the Free Software Foundation; either version 2 of the License, or
//# (at your option) any later version.
//#
//# This program is distributed in the hope that it will be useful,
//# but WITHOUT ANY WARRANTY; without even the implied warranty of
//# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//# GNU General Public License for more details.
//# 
//# You should have received a copy of the GNU General Public License
//# along with this program; if not, write to the Free Software
//# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
//#############################################################################


//erledigt
//#################
//	- Dorffilter:	nur weniger als x Einheiten im Dorf			(Truppen==>im Dorf)
//	- Dorffilter: 	nur mehr als x eigene Einheiten im Dorf			(Truppen==>eigene)
//	- Dorffilter: 	nur Unterstützungen in anderen Dörfern			(Truppen==>Unterstützungen)
//	- Dorffilter: 	nur unausgebaute Dörfer					(Gebäude)
//	- Dorffilter: 	nur mehr als x eigene Einheiten				(Kombiniert)
//	- Dorffilter: 	nur mehr als x freie BH-Plätze oder Truppenbau aktiv	(Kombiniert)
//	- Dorffilter: 	nur weniger als x freie BH-Plätze & kein Truppenbau	(Kombiniert)
//	- Dorffilter: 	nur nicht komplett erforschte Dörfer			(Kombiniert)
//	- Dorffilter:	nur angegriffene Dörfer					(Kombiniert)
//	- Zählen:	Zusammenzählen + ø (eigene+unterwegs+außerhalb)		(Truppen==>Alle)
//	- Zählen:	Unterstützung von eigenen & fremden Dörfern		(Truppen==>Unterstützungen)
//	- Auflisten:	Unterstützungen pro Zieldorf (+ BB-Code) auflisten,
//			sortiert nach eigenen & fremden Dörfern			(Truppen==>Unterstützungen)
//	- Gruppenbearbeitung: alle markieren / keine markieren über Tabelle links
//	- Gruppenbearbeitung: Speichern über Tabelle rechts
//	- Vorselektion:	OK-Button auf der Bestätigungsseite für Angriffe/Unterstützung
//	- Bearbeiten (Dörfer hinzufügen/entfernen) der aktuellen Gruppe ohne Gruppen-Popup
//##########################################################################################################################
//Changelog
//#################
//  - 0.9.8.7 - 07.01.11 - hosted@github
//	- 0.9.8.4 - 08.08.10 - Hinzufügen einer neuen Zeile bei Kombiniert in der die Endzeit der Produktionen angezeigt werden
//	- 0.9.8.3 - 08.07.10 - Anpassung an DS-Update
//				2 weitere Filter für AGs hinzugefügt (nur Dörfer mit genau, minimal oder maximal x AGs)
//	- 0.9.8.2 - 22.10.09 - Veröffentlichung

//##########################################################################################################################
//2do
//#################
//	- Cookie für MaRek und Gruppenaufkarte setzen (korrektes Cookiehandling nach Vorlage der beiden Scripte umsetzen) (alpha)
//	- Verteidigung: Dörfer ausblenden wenn weniger als x Einheit im Dorf (filterTroups)
//	- nur Off oder nur Deff anzeigen (axt+lkav > speer+schwert+bogen = off)
//	- einstellungs-gui hinzufügen
//	- Verteidigung: Dörfer ohne Fremddeff ausblenden
//	- Verteidigung: Auflisten der Truppen im Dorf
//##########################################################################################################################
//Einstellungen
//#################
//ausgebaute Dörfer: ersetze 0 durch Punktezahl von fertig ausgebauten Dörfern
	var readyPointArray = new Array(
		"9726",
		"9535",
		"0",
		"0",
		"0",
		"0",
		"0",
		"0",
		"0",
		"0");
//Bildadressen:
//	Eigene Bilder können beispielsweise unter folgender Adresse einfach umgewandelt werden:
//	http://www.webmaster-eye.de/bild-base64-encode.html
//	Wenn die Seite nicht mehr geht, einfach mal tief in die Glasgoogle schauen und nach base64 encoder suchen.
	var filterImage = "data:image/gif;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A"+
		"/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9oIDQ0AOJ2xLTgAAAIkSURBVCjP"+
		"pZLdS5MBHIWf7d36MNJcaq3pNJuuooETpZwoQaKhFXRXN0GXBV3kP6E3QiiURVRQghSKZZkafWmY"+
		"mjMY5N7caBs0mzhYgpsf295fF9EMvKtzdy4OD4dz4B+l+9sshmYlHlvCPzVKNDiHiGAqLMN2opHs"+
		"PAv7Sip1W4IL/kn5Oj7IdP8tci2lWB0udHo9YdXNot+Ds+USjoaLWMpdOgDDH9Lcmz4+Ddym8Wob"+
		"+Udr8M37SCZTNDRdZiWsMtzZipZMEQnMyP6DVb+B32ZfSvvZXHEPdUt8OSRPerrFYFAEkPt3OiQe"+
		"C4j6sU/aW3LE++GxAOgBfFMjmCyHsB1vZCOxgtFoICd7NwDbjEaS6wnM5U6KnfXMjQ2QCUZDKlaH"+
		"i9TGGpqWRlGUTH29oqBpGsm1BFZHLdGgl0xH0TR0ej2pVJr3YxN03bzHSjwOwI2uu6wmVjnddAq9"+
		"oiCatkk0FdoIq26278yiIM+EQVFYX98AIJlMUpCfx46sXSyoM5iKyjb3m59+Jm0tOfJlrFd+Lvlk"+
		"enxQTtbXiLPimLwe6pVYRJWg55W0n9kjnrcPJbNjJOiWzy8e4H3XT3NrJwfslYSCQbR0GmtJCcs/"+
		"AjzvuIbZXonrwnXMpdW6zAG+z0+IZ/gRntEeiivqsTpq0SsKYXUG/+QIdlczVeevUHSkTrflcpGA"+
		"W2ILAdTxp0SDXkQ0TIU2DtedY6/Vjrm0Wsf/6he5EPQHVrlBkQAAAABJRU5ErkJggg==";
	var restoreFilterImage = "graphic/group_jump.png";
	var sumImagePerVillage = "graphic/buildings/main.png";
	var attackImage = "/graphic/command/attack.png";
	var base64sumImage = "data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAIAAACQKrqGAAAABnRSTlMA/wD/AP83WBt9AAAACXBI"+
		"WXMAAAsTAAALEwEAmpwYAAABOElEQVR4AY2Qv6qCcBTHM1wcpKIXUBGKcEhwa3cRcXMN38J2J8Gt"+
		"d+gFwqWtMcH2BicFiSgElRTNzu2E3ogL9wy/8+9zzu/7+xFN0/T+Z2SL1XX9PdZ/GTJv9Ha7ybJ8"+
		"Pp/bSQxUVV2v1xj30Q0GA0VRwjCMomi5XDqOs1qtHo/H6XTqhuFStDzPNU2DhiAIRVFA0bIsSZJQ"+
		"GKS9N/hycRzPZjOgTdME4nK5HI/HFvhAoQq98XhMkqTneS2EQfcDqInjOJZlp9OpKIqdSox+j5Zl"+
		"aRgGwzBpmkIdNGw2myAIkOkEwHtt2x4Oh7vdDnv7/Z6iqO12iykBDte7rqvrOk3Ti8UCKvf7/XA4"+
		"ZFnm+/5kMvlhcOJ6vfI8T3wZiEmS5GNrVVXwZNiEN7TnaDSaz+eYdgLa9l/BE0E5/nqjthFlAAAA"+
		"AElFTkSuQmCC";
	var base64VillagesUp = "data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAAsAAAALBAMAAABbgmoVAAAAMFBMVEUAAACJY0itinR6W0iyi3SN"+
		"aVCGXkmsiG6wkHavknt/ZVQAAAAAAAAAAAAAAAAAAADqpYZEAAAAEHRSTlMA/////////////wAA"+
		"AAAA1I9sLAAAAEBJREFUeAFjYGDgYgCD4AYwJawAoliFNUEUY3IRiApMVnIAUoLCRUCKUVC4xBPI"+
		"CRPWaHFgEGQQVmBSAEqC9AEA7nkG9TFWVmkAAAAASUVORK5CYII=";
	var base64VillagesDown = "data:image/png;base64,"+
		"iVBORw0KGgoAAAANSUhEUgAAAAsAAAALBAMAAABbgmoVAAAAMFBMVEUAAACJY0itinR6W0iyi3SN"+
		"aVCGXkmsiG6wkHavknt/ZVQAAAAAAAAAAAAAAAAAAADqpYZEAAAAEHRSTlMA/////////////wAA"+
		"AAAA1I9sLAAAAENJREFUeAFjYGBQFmBgYFACUowCDC4dymKBAgycLsWCgkBRp2JBkKSTcmIAkGIq"+
		"TgSSDJzKoiAKoo+BoRkkxcDABcQAKfgG9R9nmZkAAAAASUVORK5CYII=";
//	
//#####################################################################################################
//XPaths
//#################
// einfachste Möglichkeit eigene XPaths zu erhalten (ohne durchzählen zu müssen) ist die Extension
// Firebug für Firefox. Damit kann man mit einem Rechtsklick auf ein HTML-Element den XPath kopieren.
//
// a für Korrekturen in der Gruppenansicht
	var XPathAtagTruppen = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td[4]/a";
	//MaRek
	var XPathMaRekTbody = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/table/tbody/tr";
	
	// Gruppenbearbeitung
	var XPathGroupEditTbody = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/table/tbody";
	var XPathSubmitGroupSave = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/form/p/input";
	var XPathImageLinksCombinedWithGroups = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/form/table/tbody/tr";
	var XPathImageLinksBuildingsWithGroups = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/form/table/tbody/tr";
	//var XPathContentCombinedWithGroups = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/form/table";
	// tr/th für zusätzliche Bildlinks
	var XPathImageLinksCombined = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/table[2]/tbody/tr";
	var XPathImageLinksTroupsComplete = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/table[3]/tbody/tr/th[2]";
	var XPathImageLinksTroupsOwnHome = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/table[4]/tbody/tr";
	var XPathImageLinksTroupsThere = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/table[4]/tbody/tr";
	var XPathImageLinksTroupsAwayDetail = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/form/table/tbody/tr/th[2]";
	var XPathImageLinksBuildings = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/table[2]/tbody/tr";
// Textbox bei Truppenunterstützungen
	var XPathTextboxTroupsAwayDetail = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/table/tbody";
	var XPathTextboxMarekTr = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div/table[2]/tbody/tr";
// table für die eigentliche Prüfung
	var XPathContentTroupsComplete = '//*[@id="units_table"]';
	var XPathContentCombined = '//*[@id="combined_table"]';
	var XPathContentTroupsOwn = '//*[@id="units_table"]';
	var XPathContentTroupsThere = '//*[@id="units_table"]';
	var XPathContentTroupsAwayDetail = '//*[@id="units_table"]';
	var XPathContentConfirmSubmit = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/form/input[17]";
//#####################################################################################################

if(document.URL.match("&screen=overview_villages")) {
	// Gruppenbearbeitungslink hinzufügen
	var XPathGroupEdit = "/html/body/table[3]/tbody/tr/td/table/tbody/tr/td/table/tbody/tr/td/div[2]/table/tbody/tr/td";
				
	var tdXP = document.evaluate(XPathGroupEdit, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!tdXP.singleNodeValue) {
		//return false;
	}
	var td = tdXP.singleNodeValue;
	//td.setAttribute("nowrap","nowrap");
	var href = document.location.href;
	if(href.match("&group=") && !href.match("edit_group")) {
		//var group_id = href.match(/\bgroup=([0-9]+)$/)[1];
		var group_id = href.match(/\bgroup=([0-9]+)/)[1];
		var newA = document.createElement("a");
			newA.setAttribute("href",href += "&edit_group=" + group_id);
			newA.innerHTML = ">>bearbeiten<<";
		var img = document.createElement("img");
			img.src = "graphic/rename.png";
			img.title = "aktuelle Gruppe bearbeiten";
			img.style.cursor = "pointer";
			img.addEventListener("click", function() {
				href += "&edit_group=" + group_id;
				document.location.href = href;
				} ,false);
		var leer = document.createTextNode(" ");
		if(group_id && group_id > 0) {
			td.appendChild(leer);
			td.appendChild(newA);
		}
	}
}

if(document.URL.match("&screen=train&mode=mass")) {
	var trXP = document.evaluate(XPathTextboxMarekTr, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!trXP.singleNodeValue) {
		return false;
	}
	var tr = trXP.singleNodeValue;
	var tBody = tr.parentNode;
	var newTr = document.createElement("tr");
	var td = document.createElement("td");
		td.setAttribute("colspan","2");
	var strong = document.createElement("strong");
		strong.innerHTML = "  Rekrutierungsdaten ";
	td.appendChild(strong);
	var a = document.createElement("a");
		a.href = "#";
		a.innerHTML = "aus Cookie auslesen";
		a.addEventListener("click",function(e) { readMaRek(e); },false);
	td.appendChild(a);
	strong = document.createElement("strong");
	strong.innerHTML = " oder ";
	td.appendChild(strong);
	a = document.createElement("a");
		a.href = "#";
		a.innerHTML = "als Cookie speichern";
		a.addEventListener("click",function(e) { saveMaRekCookie(e); },false);
	td.appendChild(a);
	newTr.appendChild(td);
	tBody.appendChild(newTr);

	var newTr1 = document.createElement("tr");
	var td1 = document.createElement("td");
		td1.setAttribute("colspan","2");
	var strong1 = document.createElement("strong");
		strong1.innerHTML = "  Gruppen auf Karte ";
	td1.appendChild(strong1);
	var a1 = document.createElement("a");
		a1.href = "#";
		a1.innerHTML = "aus Cookie auslesen";
		a1.addEventListener("click",function(e) { readGruppenAufKarte(e); },false);
	td1.appendChild(a1);
	strong1 = document.createElement("strong");
	strong1.innerHTML = " oder ";
	td1.appendChild(strong1);
	a1 = document.createElement("a");
		a1.href = "#";
		a1.innerHTML = "als Cookie speichern";
		a1.addEventListener("click",function(e) { saveMaRekCookie(e); },false);
	td1.appendChild(a1);
	
	newTr1.appendChild(td1);
	tBody.appendChild(newTr1);

} else if(document.URL.match("&type=own_home")) {
// Truppen==>eigene
	var trXP = document.evaluate(XPathImageLinksTroupsOwnHome, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!trXP.singleNodeValue) {
		return false;
	}
	var tr = trXP.singleNodeValue;
	tableheaders = tr.getElementsByTagName("th");
	for(var x = 2; x < tableheaders.length; x++) {
		var imgs = tableheaders[x].getElementsByTagName("img");
		if(imgs.length > 0) {
			var imgOrig = imgs[0];
			var img = document.createElement("img");
				img.setAttribute("id",x-1);
				img.setAttribute("src",filterImage);
				img.setAttribute("alt",imgOrig.title);
				img.setAttribute("title",imgOrig.title + " < definierter Anzahl ausblenden");
				img.style.cursor = "pointer";
				img.addEventListener("click",function(e) { filterTroups(e); },false);
			tableheaders[x].appendChild(document.createTextNode(" "));
			tableheaders[x].appendChild(img);
		}
	}
} else if(document.URL.match("&type=there")) {
// Truppen==>im Dorf
	var trXP = document.evaluate(XPathImageLinksTroupsThere, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!trXP.singleNodeValue) {
		return false;
	}
	var tr = trXP.singleNodeValue;
	tableheaders = tr.getElementsByTagName("th");
	for(var x = 2; x < tableheaders.length; x++) {
		var imgs = tableheaders[x].getElementsByTagName("img");
		if(imgs.length > 0) {
			var imgOrig = imgs[0];
			var img = document.createElement("img");
				img.setAttribute("id",x-1);
				img.setAttribute("src",filterImage);
				img.setAttribute("alt",imgOrig.title);
				img.setAttribute("title",imgOrig.title + " > definierter Anzahl ausblenden");
				img.style.cursor = "pointer";
				img.addEventListener("click",function(e) { filterTroups(e); },false);
			tableheaders[x].appendChild(document.createTextNode(" "));
			tableheaders[x].appendChild(img);
		}
	}
} else if(document.URL.match("&type=away_detail")){
// Truppen==>Unterstützungen
	var thXP = document.evaluate(XPathImageLinksTroupsAwayDetail, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!thXP.singleNodeValue) {
			return false;
	}	
	var th = thXP.singleNodeValue;
	var img = document.createElement("img");
		img.setAttribute("id","getTroupSum");
		img.setAttribute("src",base64sumImage);
		img.setAttribute("alt","Summe aller als Unterstützung stehenden Truppen ermitteln");
		img.setAttribute("title","Summe aller als Unterstützung stehenden Truppen ermitteln");
		img.style.cursor = "pointer";
		img.addEventListener("click",function() { filterTroupsOutside("sumAll"); },false);
	th.appendChild(document.createTextNode(" "));
	th.appendChild(img);
	img = document.createElement("img");
		img.setAttribute("id","getTroupSumPerVillage");
		img.setAttribute("src",sumImagePerVillage);
		img.setAttribute("alt","Summe aller als Unterstützung stehenden Truppen pro Dorf ermitteln");
		img.setAttribute("title","Summe aller als Unterstützung stehenden Truppen pro Dorf ermitteln");
		img.style.cursor = "pointer";
		img.addEventListener("click",function() { filterTroupsOutside("sumVillages"); },false);
	th.appendChild(document.createTextNode(" "));
	th.appendChild(img);
	img = document.createElement("img");
		img.setAttribute("id","filterTroups");
		img.setAttribute("src",filterImage);
		img.setAttribute("alt","Dörfer ohne Unterstützung ausblenden");
		img.setAttribute("title","Dörfer ohne Unterstützung ausblenden");
		img.style.cursor = "pointer";
		img.addEventListener("click",function() { filterTroupsOutside("filter"); },false);
	th.appendChild(document.createTextNode(" "));
	th.appendChild(img);
} else if(document.URL.match("&type=complete")) {
// Truppen==>Alle
	var thXP = document.evaluate(XPathImageLinksTroupsComplete, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!thXP.singleNodeValue) {
			return false;
	}	
	var th = thXP.singleNodeValue;
	var img = document.createElement("img");
		img.setAttribute("id","getTroupSum");
		img.setAttribute("src",base64sumImage);
		img.setAttribute("alt","Summe aller eigenen Truppen ermitteln");
		img.setAttribute("title","Summe aller eigenen Truppen ermitteln");
		img.style.cursor = "pointer";
		img.addEventListener("click",function() { countSumTroupsComplete("sumComplete"); },false);
	th.appendChild(document.createTextNode(" "));
	th.appendChild(img);	
} else if(document.URL.match("&mode=buildings")) {
// Gebäude
	var trXP = document.evaluate(XPathImageLinksBuildings, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!trXP.singleNodeValue) {
		// Gruppenbearbeitung geöffnet
		trXP = document.evaluate(XPathImageLinksBuildingsWithGroups, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if(!trXP.singleNodeValue) {
			return false;
		}
	}	
	var tr = trXP.singleNodeValue;
	var th = tr.getElementsByTagName("th")[1];
	var img = document.createElement("img");
		img.setAttribute("id","filterBuildings");
		img.setAttribute("src",filterImage);
		img.setAttribute("alt","ausgebaute Dörfer ausblenden");
		img.setAttribute("title","ausgebaute Dörfer ausblenden");
		img.style.cursor = "pointer";
		img.addEventListener("click",filterReadyBuildings,false);
	th.appendChild(document.createTextNode(" "));
	th.appendChild(img);
	th = tr.getElementsByTagName("th")[17];
	img = document.createElement("img");
		img.setAttribute("id","filterFullDefenceBuildings");
		img.setAttribute("src",filterImage);
		img.setAttribute("alt","Dörfer mit Wall 20 und VP 1 ausblenden");
		img.setAttribute("title","Dörfer mit Wall 20 und VP 1 ausblenden");
		img.style.cursor = "pointer";
		img.addEventListener("click",filterFullDefenceBuildings,false);
	th.appendChild(document.createTextNode(" "));
	th.appendChild(img);
	
} else if(document.URL.match("&mode=combined")) {
// Kombiniert
	var trXP = document.evaluate(XPathImageLinksCombined, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!trXP.singleNodeValue) {
		// Gruppenbearbeitung geöffnet
		trXP = document.evaluate(XPathImageLinksCombinedWithGroups, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if(!trXP.singleNodeValue) {
			return false;
		}
	}
	var tr = trXP.singleNodeValue;
	tableheaders = tr.getElementsByTagName("th");
	//5=Forschung; 6=bh; 7-17=einheiten; 18=ag
	var img = document.createElement("img");
		img.setAttribute("id","5");
		img.setAttribute("src",filterImage);
		img.setAttribute("title","nur Dörfer mit Forschungsmöglichkeit anzeigen");
		img.setAttribute("alt","filterScience");
		img.style.cursor = "pointer";
		img.addEventListener("click",function(e) { filterTroups(e); }, false);
	tableheaders[5].appendChild(document.createTextNode(" "));
	tableheaders[5].appendChild(img);
	img = document.createElement("img");
		img.setAttribute("id","6");
		img.setAttribute("src",base64VillagesDown);
		img.setAttribute("title","nur volle Dörfer anzeigen");
		img.setAttribute("alt","filterFull");
		img.style.cursor = "pointer";
		img.addEventListener("click",function(e) { filterTroups(e); },false);
	tableheaders[6].appendChild(document.createTextNode(" "));
	tableheaders[6].appendChild(img);
	img = document.createElement("img");
		img.setAttribute("id","6");
		img.setAttribute("src",base64VillagesUp);
		img.setAttribute("title","nur \"unvolle\" Dörfer anzeigen");
		img.setAttribute("alt","filterUnfull");
		img.style.cursor = "pointer";
		img.addEventListener("click",function(e) { filterTroups(e); },false);
	tableheaders[6].appendChild(document.createTextNode(" "));
	tableheaders[6].appendChild(img);
	img = document.createElement("img");
		img.setAttribute("src",attackImage);
		img.setAttribute("title","nur Dörfer anzeigen auf die Angriffe laufen");
		img.style.cursor = "pointer";
		img.addEventListener("click",function(e) { filterAttacked(e) },false);
	tableheaders[0].appendChild(document.createTextNode(" "));
	tableheaders[0].appendChild(img);
	img = document.createElement("img");
		img.setAttribute("src",filterImage);
		img.setAttribute("title","Produktionsdetails einblenden");
		img.style.cursor = "pointer";
		img.setAttribute("id","prodDetails");
		img.addEventListener("click",function(e) { showProductionDetails() },false);
	tableheaders[0].appendChild(document.createTextNode(" "));
	tableheaders[0].appendChild(img);
	for(var x = 7; x < tableheaders.length; x++) {
		var imgs = tableheaders[x].getElementsByTagName("img");
		if(imgs.length > 0) {
			if(x<18) {
				var imgOrig = imgs[0];
				var img = document.createElement("img");
					img.setAttribute("id",x);
					img.setAttribute("src",filterImage);
					img.setAttribute("alt",imgOrig.title);
					img.setAttribute("title",imgOrig.title + " < definierter Anzahl ausblenden");
					img.style.cursor = "pointer";
					img.addEventListener("click",function(e) { filterTroups(e); },false);
				tableheaders[x].appendChild(document.createTextNode(" "));
				tableheaders[x].appendChild(img);
			} else if(x == 18) {
				// AH
				var imgOrig = imgs[0];
				var img = document.createElement("img");
					img.setAttribute("id",x);
					img.setAttribute("src",filterImage);
					img.setAttribute("alt","genau");
					img.setAttribute("title",imgOrig.title + " mit nicht genau definierter Anzahl ausblenden");
					img.style.cursor = "pointer";
					img.addEventListener("click",function(e) { filterTroups(e); },false);
				tableheaders[x].appendChild(document.createTextNode(" "));
				tableheaders[x].appendChild(img);

				img = document.createElement("img");
					img.setAttribute("id",x);
					img.setAttribute("src",filterImage);
					img.setAttribute("alt","min");
					img.setAttribute("title",imgOrig.title + " < definierter Anzahl ausblenden");
					img.style.cursor = "pointer";
					img.addEventListener("click",function(e) { filterTroups(e); },false);
				tableheaders[x].appendChild(document.createTextNode(" "));
				tableheaders[x].appendChild(img);

				img = document.createElement("img");
					img.setAttribute("id",x);
					img.setAttribute("src",filterImage);
					img.setAttribute("alt","max");
					img.setAttribute("title",imgOrig.title + " > definierter Anzahl ausblenden");
					img.style.cursor = "pointer";
					img.addEventListener("click",function(e) { filterTroups(e); },false);
				tableheaders[x].appendChild(document.createTextNode(" "));
				tableheaders[x].appendChild(img);
			} else {
				// Markt
			}
		}
	}
} else if(document.URL.match("&try=confirm")) {
	// OK-Button auf Truppenabschickbestätigungsseite vorselektieren (fokussieren)
	var submitXP = document.evaluate(XPathContentConfirmSubmit, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!submitXP.singleNodeValue) {
		return false;
	}
	submit = submitXP.singleNodeValue;
	submit.focus();
}
if(document.URL.match("&edit_group=")) {
	var GroupTbodyXP = document.evaluate(XPathGroupEditTbody, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!GroupTbodyXP.singleNodeValue) {
		return false;
	}
	var GroupTbody = GroupTbodyXP.singleNodeValue;
	var tr = document.createElement("tr");
	var tdL = document.createElement("td");
		tdL.setAttribute("nowrap","nowrap");
	var a = document.createElement("a");
		a.innerHTML = "setzen";
		a.setAttribute("href","#");
		a.addEventListener("click",function(e) { markAllBoxes(); }, false);
	tdL.appendChild(document.createTextNode("alle Markierungen "));
	tdL.appendChild(a);
	tdL.appendChild(document.createTextNode(" "));
	a = document.createElement("a");
		a.innerHTML = "entfernen";
		a.setAttribute("href","#");
		a.addEventListener("click",function(e) { unmarkAllBoxes(); }, false);
	tdL.appendChild(a);
	tdL.appendChild(document.createTextNode(" "));
	var submit = document.createElement("input");
		submit.setAttribute("type","submit");
		submit.setAttribute("value","Gruppe speichern");
		submit.addEventListener("click",function(e) { SubmitSaveGroup(); }, false);
	tdL.appendChild(submit);
	tr.appendChild(tdL);
	GroupTbody.appendChild(tr);
}

function filterAttacked() {
// Tabelle mit den Truppen suchen
	var tableXP = document.evaluate(XPathContentCombined, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!tableXP.singleNodeValue) {
		// Gruppenbearbeitung geöffnet
		//var tableXP = document.evaluate(XPathContentCombinedWithGroups, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		//if(!tableXP.singleNodeValue) {
			return false;
		//}
	}
	var table = tableXP.singleNodeValue;
	rows = table.getElementsByTagName("tr");
	var k = 0;
	var gesammt = rows.length-1;
	for(var row = 1; row < rows.length; row++) {
		var img = rows[row].getElementsByTagName("td")[0].getElementsByTagName("span")[0].getElementsByTagName("a")[0].getElementsByTagName("img")[0];
		if(!img) {
			rows[row].parentNode.removeChild(rows[row]);
			row -= 1;
			k += 1;
		} else {
			if(!img.src.match(attackImage)) {
				rows[row].parentNode.removeChild(rows[row]);
				row -= 1;
				k += 1;
			}
		}
	}
	alert(k + "/" + gesammt + " Dörfer ohne laufende Angriffe ausgeblendet");
}

function hideProductionDetails() {
	var imgProd = document.getElementById("prodDetails");
		imgProd.setAttribute("src",filterImage);
		imgProd.setAttribute("title","Produktionsdetails einblenden");
		imgProd.addEventListener("click",function(e) { showProductionDetails() },false);
	var trXP = document.evaluate(XPathImageLinksCombined, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!trXP.singleNodeValue) {
		// Gruppenbearbeitung geöffnet
		trXP = document.evaluate(XPathImageLinksCombinedWithGroups, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if(!trXP.singleNodeValue) {
			return false;
		}
	}
	var tr = trXP.singleNodeValue;
	var tbody = tr.parentNode;
	for(var x = 1; x < tbody.getElementsByTagName("tr").length; x++) {
		tbody.getElementsByTagName("tr")[x].getElementsByTagName("td")[0].innerHTML = tbody.getElementsByTagName("tr")[x].getElementsByTagName("td")[0].innerHTML.split("<br>&nbsp;&nbsp;&nbsp;<img")[0];
		tbody.getElementsByTagName("tr")[x].setAttribute("valign","middle");
	}
}

function showProductionDetails() {
	// Zeile für "fertig gebaut" anzeigen
	var trXP = document.evaluate(XPathImageLinksCombined, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!trXP.singleNodeValue) {
		// Gruppenbearbeitung geöffnet
		trXP = document.evaluate(XPathImageLinksCombinedWithGroups, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if(!trXP.singleNodeValue) {
			return false;
		}
	}
	var tr = trXP.singleNodeValue;
	var tbody = tr.parentNode;
	var imgProd = document.getElementById("prodDetails");
	if(!imgProd.src.match(restoreFilterImage)) {
		imgProd.setAttribute("src",restoreFilterImage);
		imgProd.setAttribute("title","Produktionsdetails ausblenden");
		imgProd.addEventListener("click",function(e) { hideProductionDetails() },false);
	} else {
		return false;
	}
	var trs = tbody.getElementsByTagName("tr");
	//alert(trs[1].getElementsByTagName("td")[1].getElementsByTagName("a")[0].getElementsByTagName("img")[0].title);
	for(var x = 1; x < trs.length; x++) {
		trs[x].setAttribute("valign","top");
		var td = trs[x].getElementsByTagName("td")[0];
		var hgTime = trs[x].getElementsByTagName("td")[1].getElementsByTagName("a")[0].getElementsByTagName("img")[0].title;
		if(hgTime !== "Keine Produktion") {
			hgTime = hgTime.split("Uhr")[0] + "Uhr";
		} else {
			hgTime = "<font color='red'>" + hgTime + "</font>";
		}
		hgTime = "<br>&nbsp;&nbsp;&nbsp;<img src=\"" + trs[0].getElementsByTagName("th")[1].getElementsByTagName("img")[0].src + "\" title=\"" + trs[x].getElementsByTagName("td")[1].getElementsByTagName("a")[0].getElementsByTagName("img")[0].title + "\" />&nbsp;<b>" + hgTime + "</b>";
		var kasTime = trs[x].getElementsByTagName("td")[2].getElementsByTagName("a")[0].getElementsByTagName("img")[0].title;
		if(kasTime !== "Keine Rekrutierung") {
			kasTime = kasTime.split("Uhr")[0] + "Uhr";
		} else {
			kasTime = "";//"<font color='red'>" + kasTime + "</font>";
		}
		kasTime = "<br>&nbsp;&nbsp;&nbsp;<img src=\"" + trs[0].getElementsByTagName("th")[2].getElementsByTagName("img")[0].src + "\" title=\"" + trs[x].getElementsByTagName("td")[2].getElementsByTagName("a")[0].getElementsByTagName("img")[0].title + "\" />&nbsp;<b>" + kasTime + "</b>";
		var stallTime = trs[x].getElementsByTagName("td")[3].getElementsByTagName("a")[0].getElementsByTagName("img")[0].title;
		if(stallTime !== "Keine Rekrutierung") {
			stallTime = stallTime.split("Uhr")[0] + "Uhr";
		} else {
			stallTime = "";//"<font color='red'>" + stallTime + "</font>";
		}
		stallTime = "<br>&nbsp;&nbsp;&nbsp;<img src=\"" + trs[0].getElementsByTagName("th")[3].getElementsByTagName("img")[0].src + "\" title=\"" + trs[x].getElementsByTagName("td")[3].getElementsByTagName("a")[0].getElementsByTagName("img")[0].title + "\" />&nbsp;<b>" + stallTime + "</b>";
		var stattTime = trs[x].getElementsByTagName("td")[4].getElementsByTagName("a")[0].getElementsByTagName("img")[0].title;
		if(stattTime !== "Keine Rekrutierung") {
			stattTime = stattTime.split("Uhr")[0] + "Uhr";
		} else {
			stattTime = "";//"<font color='red'>" + stattTime + "</font>";
		}
		stattTime = "<br>&nbsp;&nbsp;&nbsp;<img src=\"" + trs[0].getElementsByTagName("th")[4].getElementsByTagName("img")[0].src + "\" title=\"" + trs[x].getElementsByTagName("td")[4].getElementsByTagName("a")[0].getElementsByTagName("img")[0].title + "\" />&nbsp;<b>" + stattTime + "</b>";
		td.innerHTML += hgTime + kasTime + stallTime + stattTime;
		//td.innerHTML += "<br>&nbsp;&nbsp;&nbsp;HG <b>" + hgTime + "</b><br>&nbsp;&nbsp;&nbsp;Kas <b>" + kasTime + "</b><br>&nbsp;&nbsp;&nbsp;Stall <b>" + stallTime + "</b><br>&nbsp;&nbsp;&nbsp;Werkstatt <b>" + stattTime + "</b>";
	}
}

function SubmitSaveGroup() {
	var submitGroupXP = document.evaluate(XPathSubmitGroupSave, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!submitGroupXP.singleNodeValue) {
		return false;
	}
	var submitGroup = submitGroupXP.singleNodeValue;
	submitGroup.click();
}

function markAllBoxes() {
	var formXP = document.evaluate('//*[@id="edit_group_membership_form"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!formXP.singleNodeValue) {
		alert('mark all boxes failed to initialize during false XPath');
		return false;
	}
	var form = formXP.singleNodeValue;
	var k = 0;
	for(var i = 0; i < form.elements.length; i++) {
		if(form.elements[i].type == "checkbox") {
			form.elements[i].checked = true;
			k += 1;
		}
	}
	alert("Alle " + k + " Markierungen gesetzt!");
}

function unmarkAllBoxes() {
	var formXP = document.evaluate('//*[@id="edit_group_membership_form"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!formXP.singleNodeValue) {
		alert('mark all boxes failed to initialize during false XPath');
		return false;
	}
	var form = formXP.singleNodeValue;
	var k = 0;
	for(var i = 0; i < form.elements.length; i++) {
		if(form.elements[i].type == "checkbox") {
			form.elements[i].checked = false;
			k += 1;
		}
	}
	alert("Alle " + k + " Markierungen entfernt!");
}

function formatNumber(number) {
	var nBegriff = "";
	number = number.toString()
	for (var i = number.length - 3; i >0; i-=3){
		var sub = number.substr(i, 3);
		if (nBegriff) nBegriff = "." + nBegriff;
		nBegriff = sub + nBegriff;
	}
	if (nBegriff) nBegriff = "." + nBegriff;
	return number.substr(0, (3+i)) + nBegriff;
}

function countSumTroupsComplete(action) {
// Tabelle mit den Truppen suchen
	var tableXP = document.evaluate(XPathContentTroupsComplete, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!tableXP.singleNodeValue) {
		return false;
	}
	var table = tableXP.singleNodeValue;
	//Auflistung aller Zeilen (inkl. Header) in Variable rows
	rows = table.getElementsByTagName("tr");
	var gesammt = rows.length-1;
	var textbox = document.getElementById("ausgabebox");
	if(!textbox) {
		var tBodyXP = document.evaluate(XPathTextboxTroupsAwayDetail, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if(!tBodyXP.singleNodeValue) {
			return false;
		}
		var tBody = tBodyXP.singleNodeValue;
		var textbox = document.createElement("textarea");
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		var br = document.createElement("br");
		textbox.setAttribute("type","text");
		textbox.setAttribute("cols","50");
		textbox.setAttribute("rows","10");
		textbox.setAttribute("id","ausgabebox");
		td.setAttribute("colspan",9);
		td.setAttribute("align","center");
		td.appendChild(textbox);
		tr.appendChild(td);
		tBody.appendChild(tr);
	}
	var hilfsArray1 = new Array(
		"eigene im Dorf stehende Einheiten",
		"eigene Einheiten außerhalb",
		"eigene Einheiten auf der Reise");
	// Standort für spätere dynamische Umsetzung der 3 identischen Schleifen unten
	var hilfsArray = new Array(
		"standort",
		"Speerträger",
		"Schwertkämpfer",
		"Axtkämpfer",
		"Bogenschützen",
		"Späher",
		"leichte Kavellerie",
		"berittene Bogenschützen",
		"schwere Kavellerie",
		"Rammböcke",
		"Katapulte",
		"Paladin",
		"Adelsgeschlechter");
	var units = new Array();
	for(var x = 0; x < 4; x++) {
		units[x] = new Array(13);
		for(var troupID = 0; troupID < units[x].length; troupID++) {
			units[x][troupID] = 0;
		}
	}
	if(rows.length > 1) {
		for(var row = 0; row < rows.length; row++) {
			var typeOfTroup = 3;
			if(rows[row].className == "units_home"){
				typeOfTroup = 0;
			} else if(rows[row].className == "units_away"){
				typeOfTroup = 1;
			} else if(rows[row].className == "units_moving"){
				typeOfTroup = 2;
			} else {
				typeOfTroup = 3;
			}
			if(typeOfTroup != 3) {
				var cells = rows[row].getElementsByTagName("td");
				for(var cell = 1; cell < 13; cell++) {
					var testWert = units[typeOfTroup][cell]+parseInt(cells[cell].innerHTML);
					units[typeOfTroup][cell] = testWert;
				}
			}
		}
		var message ="";
		for(var y = 0; y < 3; y++) {
			message += "[b]" + hilfsArray1[y] + "[/b]:\n";
			for(var x = 1; x < 13; x++) {
				units[3][x] += units[y][x];
				message += hilfsArray[x] +": " + formatNumber(units[y][x]) + "\n";
			}
			message += "\n";
		}
		message += "[b]alles zusammengezählt:[/b]\n";
		for(var x = 1; x < 13; x++) {
			var testWert = 0;
			testWert = parseInt(units[3][x]/(gesammt/5));
			//alert("testwert = " + units[3][x] + "/" + gesammt/5 + "\nErgebniss: " + testWert);
			message += hilfsArray[x] + ": " + formatNumber(units[3][x]) + " (ø pro Dorf: " + formatNumber(testWert) + ")\n";
		}
		message += "\n\n[i]Diese Statisktik wurde erstellt von [url=www.stasiknecht.de/scripts.php?src=ThorsFilterPack]ThorsFilterPack[/url][/i]";
		textbox.value = message;
		textbox.focus();
		textbox.select();
	}
}

function filterFullDefenceBuildings() {
	var img = document.getElementById("filterFullDefenceBuildings");
	if(!img.src.match(restoreFilterImage)) {
		img.setAttribute("src",restoreFilterImage);
		img.setAttribute("alt","alle Dörfer anzeigen");
		img.setAttribute("title","alle Dörfer anzeigen");
		img.addEventListener("click",function() { document.location.href = document.location; },false);
	} else {
		return false;
	}
	var main = document.getElementsByTagName("table");
	for(var a = 0; a < main.length; a++) {
		if(main[a].className == "main") {
			var par = main[a].getElementsByTagName("table");
			for(var i = 0; i < par.length; i++) {
				if(par[i].className = "vis") {
					rows = par[i].getElementsByTagName("tr");
					if(rows.length > 1) {
						if(rows[1].className.match("row_a") || rows[1].className.match("row_b")) {
							var k = 0;
							var punkte;
							var gesammt;
							gesammt=rows.length-1;
							for(var j = 0; j < rows.length; j++) {
								if(rows[j].className.match("row_a") || rows[j].className.match("row_b")) {
									var cells = rows[j].getElementsByTagName("td");
									//alert("VP: " + cells[8].innerHTML + " Wall: " + cells[17].innerHTML);
									//punkte = cells[1].innerHTML.replace("<span class=\"grey\">.</span>","");
									if(cells[8].innerHTML == "1" && cells[17].innerHTML == "20") {
										rows[j].parentNode.removeChild(rows[j]);
										k += 1;
										j -= 1;
										//break;
									}
								}
							}
							if(k!=0) { alert(k + "/" + gesammt + " Dörfer mit Wall 20 und VP 1 ausgeblendet!"); }
						}
					}
				}
			}
		}
	}
}

function filterReadyBuildings() {
	var img = document.getElementById("filterBuildings");
	if(!img.src.match(restoreFilterImage)) {
		img.setAttribute("src",restoreFilterImage);
		img.setAttribute("alt","alle Dörfer anzeigen");
		img.setAttribute("title","alle Dörfer anzeigen");
		img.addEventListener("click",function() { document.location.href = document.location; },false);
	} else {
		return false;
	}
	var main = document.getElementsByTagName("table");
	for(var a = 0; a < main.length; a++) {
		if(main[a].className == "main") {
			var par = main[a].getElementsByTagName("table");
			for(var i = 0; i < par.length; i++) {
				if(par[i].className = "vis") {
					rows = par[i].getElementsByTagName("tr");
					if(rows.length > 1) {
						if(rows[1].className.match("row_a") || rows[1].className.match("row_b")) {
							var k = 0;
							var punkte;
							var gesammt;
							gesammt=rows.length-1;
							for(var j = 0; j < rows.length; j++) {
								if(rows[j].className.match("row_a") || rows[j].className.match("row_b")) {
									var cells = rows[j].getElementsByTagName("td");
									punkte = cells[1].innerHTML.replace("<span class=\"grey\">.</span>","");
									for(var punktezaehler = 0; punktezaehler < readyPointArray.length; punktezaehler++) {
										if(punkte == readyPointArray[punktezaehler]) {
											rows[j].parentNode.removeChild(rows[j]);
											k += 1;
											j -= 1;
											break;
										}
									}
								}
							}
							if(k!=0) { alert(k + "/" + gesammt + " fertig ausgebaute Dörfer ausgeblendet!"); }
						}
					}
				}
			}
		}
	}
}

function filterTroupsOutside(action) {
// Truppen==>Unterstützungen filter und zählen
	if(action == "filter") {
	// Wenn gefiltert wird,
		var img = document.getElementById("filterTroups");
		// abfragen ob Symbol als "alle Dörfer anzeigen" fungiert.
		if(!img.src.match(restoreFilterImage)) {
		// Wenn Nein: Filtersymbol zu "alle Dörfer anzeigen" umwandeln
			img.setAttribute("src",restoreFilterImage);
			img.setAttribute("alt","alle Dörfer anzeigen");
			img.setAttribute("title","alle Dörfer anzeigen");
			img.style.cursor = "pointer";
			img.addEventListener("click",function() { document.location.href=document.location; },false);
		} else {
		//wenn Ja: Funtion abbrechen
		//(überlagert sich sonst mit dem 2. Clickevent zum Neuladen des Frames)
			return false;
		}
	}
	// Tabelle mit den Truppen suchen
	var tableXP = document.evaluate(XPathContentTroupsAwayDetail, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!tableXP.singleNodeValue) {
		return false;
	}
	var table = tableXP.singleNodeValue;
	//Auflistung aller Zeilen (inkl. Header) in Variable rows
	rows = table.getElementsByTagName("tr");
	var gesammt = rows.length-1;
	var entfernt = 0;
	if(action == "sumVillages" || action=="sumAll") {
		var textbox = document.getElementById("ausgabebox");
		if(!textbox) {
			var tBodyXP = document.evaluate(XPathTextboxTroupsAwayDetail, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			if(!tBodyXP.singleNodeValue) {
				//alert("Einstiegspunkt für Textfeld nicht gefunden");
				return false;
			}
			var tBody = tBodyXP.singleNodeValue;
			var textbox = document.createElement("textarea");
			var tr = document.createElement("tr");
			var td = document.createElement("td");
			var br = document.createElement("br");
			textbox.setAttribute("type","text");
			textbox.setAttribute("cols","50");
			textbox.setAttribute("rows","10");
			textbox.setAttribute("id","ausgabebox");
			td.setAttribute("colspan",9);
			td.setAttribute("align","center");
			td.appendChild(textbox);
			tr.appendChild(td);
			tBody.appendChild(tr);
		}
		var hilfsArray = new Array(
			"Dorfname",
			"Speerträger",
			"Schwertkämpfer",
			"Axtkämpfer",
			"Bogenschützen",
			"Späher",
			"leichte Kavellerie",
			"berittene Bogenschützen",
			"schwere Kavellerie",
			"Rammböcke",
			"Katapulte",
			"Paladin",
			"Adelsgeschlechter");
		var units = new Array();
		for(var villageID = 0; villageID < gesammt+1; villageID++) {
			units[villageID] = new Array(13);
			for(var troupID = 0; troupID < units[villageID].length; troupID++) {
				units[villageID][troupID] = 0;
			}
		}
		var ownVillages = new Array();
		//Unterstützung pro unterstütztem Dorf zusammenzählen
		if(gesammt > 0) {
			var x = 0;
			var dorfzaehler = 0;
			// _rückwärts_ über die Zeilen gehen; 0 gleich Header
			for(var row = gesammt; row > 0; row--) {
				if(rows[row].className!="units_away"){
					// Dorfname auf index 0 speichern
					var cells = rows[row].getElementsByTagName("td");
					var testWert1 = cells[0].getElementsByTagName("span")[0].getElementsByTagName("a")[0].innerHTML;
					for(dorfzaehler = 0; dorfzaehler < gesammt; dorfzaehler++) {
						if(units[dorfzaehler][0] == testWert1) {
							break;
						} else if(units[dorfzaehler][0] == 0) {
						// Abfrage ob eigenes oder fremdes Dorf
							units[dorfzaehler][0] = testWert1;
							break;
						} else {
						}
					}
					for(var cell = 1; cell < 13; cell++) {
						var testWert = units[dorfzaehler][cell]+parseInt(cells[cell].innerHTML.replace("<span class=\"grey\">.</span>",""))
						units[dorfzaehler][cell] = testWert;
					}
				}
			}
			for(var row = 0; row < rows.length; row++) {
				if(rows[row].className == "units_away") {
					var blubb = rows[row].getElementsByTagName("td")[0].getElementsByTagName("a")[0].getElementsByTagName("span")[0].innerHTML;
					var Xkoord = blubb.match(/\(([0-9]+)\|([0-9]+)\) K([0-9]+)$/)[1];
					var Ykoord = blubb.match(/\(([0-9]+)\|([0-9]+)\) K([0-9]+)$/)[2];
					ownVillages[row] = "[village]" + Xkoord + "|" + Ykoord + "[/village]";
				}
			}
		}
	}
	if(action == "filter") {
		var deff = 0;
		var dorfzahl = 0;
		// j > 0 wegen des Tableheaders
		for(var j = gesammt; j > 0; j--) {
			if(rows[j].className=="units_away") {
			dorfzahl += 1;
			//Dorf gefunden; wenn Dorf keine Truppen woanders stehen hat: Zeile löschen
			//ansonsten Deff wieder af 0
				if(deff == 0) {
					rows[j].parentNode.removeChild(rows[j]);
					entfernt += 1;
				} else {
					deff = 0;
				}
			} else {
			//Unterstützung gefunden; deffzähler um eins erhöhen
				deff += 1;
			}
		}
		if(entfernt != 0) {
			alert(entfernt + "/" + dorfzahl + " Dörfer ohne Unterstützung in anderen Dörfern ausgeblendet!");
			entfernt = 0;
			gesammt = rows.length-1;
		}
	} else if(action == "sumVillages") {
		var messageOwn = "\n";
		var messageForeign = "\n";
		for(var row = 0; row < rows.length; row++) {
			if(units[row][0] != 0) {
				var Xkoord = units[row][0].match(/\(([0-9]+)\|([0-9]+)\) K([0-9]+)$/)[1];
				var Ykoord = units[row][0].match(/\(([0-9]+)\|([0-9]+)\) K([0-9]+)$/)[2];
				var tmpStr = "[village]" + Xkoord + "|" + Ykoord + "[/village]";
				var foundOwnVillage = false;
				for(var z = 0; z < ownVillages.length; z++) {
					if(ownVillages[z] == tmpStr) {
						foundOwnVillage = true;
						//alert("found own Village");
						break;
					}
				}
				if(foundOwnVillage) {
					messageOwn += tmpStr + "\n";
				} else {
					messageForeign += tmpStr + "\n";
				}
				for(var cell = 1; cell < 13; cell++) {
					if(units[row][cell] != 0 && units[row][cell]) {
						if(foundOwnVillage) {
							messageOwn += hilfsArray[cell] + ": " + formatNumber(units[row][cell]) + "\n";
						} else {
							messageForeign += hilfsArray[cell] + ": " + formatNumber(units[row][cell]) + "\n";
						}
					}
				}
				if(foundOwnVillage) {
					messageOwn += "\n";
				} else {
					messageForeign += "\n";
				}
			}
		}
		messageForeign = "[b]Unterstützte fremde Dörfer[/b]\n[i](Die Unterscheidung ob eigenes oder fremdes Dorf funktioniert nur, wenn alle Dörfer angezeigt werden)[/i]\n" + messageForeign;
		messageOwn = "[b]Unterstützte eigene Dörfer[/b]\n" + messageOwn;
		var messageMaster = messageForeign + messageOwn + "\n\n[i]Diese Statisktik wurde erstellt von [url=www.stasiknecht.de/scripts.php?src=ThorsFilterPack]ThorsFilterPack[/url][/i]";
		textbox.value = messageMaster;
		textbox.focus();
		textbox.select();
		//alert(message);
	} else if(action == "sumAll") {
		var sumArrayOwn = new Array(11);
		var sumArrayForeign = new Array(11);
		for(var cell = 0; cell < 12; cell++) {
			sumArrayOwn[cell]=0;
			sumArrayForeign[cell]=0;
		}
		for(var row = 0; row < rows.length-1; row++) {
			if(units[row][0] != 0) {
				var Xkoord = units[row][0].match(/\(([0-9]+)\|([0-9]+)\) K([0-9]+)$/)[1];
				var Ykoord = units[row][0].match(/\(([0-9]+)\|([0-9]+)\) K([0-9]+)$/)[2];
				var tmpStr = "[village]" + Xkoord + "|" + Ykoord + "[/village]";
				var foundOwnVillage = false;
				for(var z = 0; z < ownVillages.length; z++) {
					if(ownVillages[z] == tmpStr) {
						foundOwnVillage = true;
						break;
					}
				}
				for(var cell = 0; cell < 12; cell++) {
					if(foundOwnVillage) {
						sumArrayOwn[cell] += units[row][cell+1];
					} else {
						sumArrayForeign[cell] += units[row][cell+1];
					}
				}
			}
		}
		var message = "[b]Summe aller Unterstützungen in eigenen Dörfern[/b]\n[i](Die Unterscheidung ob eigenes oder fremdes Dorf funktioniert nur, wenn alle Dörfer angezeigt werden)[/i]\n";
		for(var unitCount = 0; unitCount < 12; unitCount++) {
			message += hilfsArray[unitCount+1] + ": " + formatNumber(sumArrayOwn[unitCount]) + "\n";
		}
		
		message += "\n[b]Summe aller Unterstützungen in fremden Dörfern[/b]\n";
		for(var unitCount = 0; unitCount < 12; unitCount++) {
			message += hilfsArray[unitCount+1] + ": " + formatNumber(sumArrayForeign[unitCount]) + "\n";
		}
		message += "\n\n[i]Diese Statisktik wurde erstellt von [url=www.stasiknecht.de/scripts.php?src=ThorsFilterPack]ThorsFilterPack[/url][/i]";
		textbox.value = message;
		textbox.focus();
		textbox.select()
	}
}

function filterTroups(e) {
//erwartet bei Source-Attribut "id" den Index der Spalte und beim Source-Attribute "alt" den Namen der Einheit
	//Aufrufendes <img> ermitteln und Filterposition bestimmen
	var e=e? e : window.event;
	var srcImg=e.target? e.target : e.srcElement;
	var pos = parseInt(srcImg.id);
	var title = srcImg.alt
	//alert("pos: " + pos + "\ntitle: " + title);
	if(!srcImg.src.match(restoreFilterImage)) {
		var filterLowerThan = 0;
		if(document.URL.match("&type=there")) {
			filterLowerThan=parseInt(prompt("Alle gedefften Dörfer mit mehr als ... Einheiten vom Typ " + title + " ausblenden:"));
		} else if(document.URL.match("&mode=combined") && (pos == 6 || pos == 5 || pos == 18)) {
			if(pos == 6) {
				filterLowerThan=parseInt(prompt("Ein volles Dorf darf höchstens ... freie BH Plätze haben:"));
			} else if(pos == 5) {
				// Dörfer mit vollständiger Erforschung ausblenden; kein Benutzerwert notwendig
			} else if(pos == 18 && title == "genau") {
				filterLowerThan=parseInt(prompt("Nur Dörfer mit genau ... AGs anzeigen:"));
			} else if(pos == 18 && title == "max") {
				filterLowerThan=parseInt(prompt("Nur Dörfer mit ... oder weniger AGs anzeigen:"));
			} else if(pos == 18 && title == "min") {
				filterLowerThan=parseInt(prompt("Nur Dörfer mit ... oder mehr AGs anzeigen:"));
			}
		} else {
			filterLowerThan=parseInt(prompt("Alle Dörfer mit weniger als ... Einheiten vom Typ " + title + " ausblenden:"));
		}
	} else {
		return false;
	}
	if(document.URL.match("&mode=combined")) {
		var tableXP = document.evaluate(XPathContentCombined, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		//if(!tableXP.singleNodeValue) {
			// Gruppenbearbeitung geöffnet
			//tableXP = document.evaluate(XPathContentCombinedWithGroups, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			//return false;
		//}
	} else if(document.URL.match("&type=own_home")) {
		var tableXP = document.evaluate(XPathContentTroupsOwn, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	} else if(document.URL.match("&type=there")) {
		var tableXP = document.evaluate(XPathContentTroupsThere, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	}
	if(!tableXP.singleNodeValue) {
		return false;
	}
	var table = tableXP.singleNodeValue;
	rows = table.getElementsByTagName("tr");
	var bh = 0;
	var k = 0;
	var gesammt=rows.length-1;
	var value;
	for(var j = 1; j < rows.length; j++) {
		var cells = rows[j].getElementsByTagName("td");
		if(cells.length > 1) {
			// pos 5 = forschung; pos 6 = bh; pos 18 = ag
			if(document.URL.match("&mode=combined") && (pos == 18 || pos == 6)) {
				if(cells[pos].innerHTML.match("<a")) {
					//inhalt von unterelement <a> nutzen
					value = cells[pos].firstChild.innerHTML;
				} else {
					//kein weiteres Unterelement => kein AH gebaut
					value = 0;
				}
				if(pos == 6) {
					bh = parseInt(value.match(/([0-9]+) \(([0-9]+)\)/)[2]);
					value = value.match(/([0-9]+) \(([0-9]+)\)/)[1];
					//alert("BH: " + bh + "\nFrei: " + value);
				}
				value = parseInt(value);
			} else if(document.URL.match("&mode=combined") && pos == 5) {
				value = 5; // reiner dummywert, forschung
			} else {
				//alert("value:\t" + value);
				value = parseInt(cells[pos].innerHTML);
			}
			if(document.URL.match("&mode=combined") && (pos == 5 || pos == 6 || pos == 18)) {
				if(pos == 6) {
					// Einheiten produzierende Dörfer nicht als "voll" markieren
					var training = false;
					for(var trainingTypeCounter = 2; trainingTypeCounter < 5; trainingTypeCounter ++) {
						var img = cells[trainingTypeCounter].getElementsByTagName("img")[0];
						if(img.src.match("prod_running.png")) {
							training = true;
							break;
						}
					}
					//alert(training);
					if(title == "filterFull") {
						if(bh != 30 || value > filterLowerThan || training) {
						// BH unvoll ==> löschen
							rows[j].parentNode.removeChild(rows[j]);
							k += 1;
							j -= 1;
						}
					} else if(title == "filterUnfull") {
						if(bh == 30 && value < (filterLowerThan + 1) && !training) {
						// BH voll ==> löschen
							rows[j].parentNode.removeChild(rows[j]);
							k += 1;
							j -= 1;
						}
					}
				} else if(pos == 5) {
					// Dörfer ohne Forschungsmöglichkeit ausblenden
					if(cells[pos].firstChild.firstChild.src.match("prod_finish.png")) {
						rows[j].parentNode.removeChild(rows[j]);
						k += 1;
						j -= 1;
					}
				} else if(pos == 18 && title == "genau") {
					// Dörfer mit nicht genau x Ags ausblenden
					if(value != filterLowerThan) {
						rows[j].parentNode.removeChild(rows[j]);
						k += 1;
						j -= 1;
					}
				} else if(pos == 18 && title == "min") {
					// Dörfer mit weniger als x Ags ausblenden
					if(value < filterLowerThan) {
						rows[j].parentNode.removeChild(rows[j]);
						k += 1;
						j -= 1;
					}
				} else if(pos == 18 && title == "max") {
					// Dörfer mit mehr als x Ags ausblenden
					if(value > filterLowerThan) {
						rows[j].parentNode.removeChild(rows[j]);
						k += 1;
						j -= 1;
					}
				}
			} else if(document.URL.match("&type=there")) {
				if(value > filterLowerThan) {
					var z = j-1;
					rows[j].parentNode.removeChild(rows[j]);
					rows[z].parentNode.removeChild(rows[z]);
					k += 2;
					j -= 2;
				}
			} else {
				if(value < filterLowerThan) {
					if(document.URL.match("&type=own_home")) {
						var z = j-1;
						rows[j].parentNode.removeChild(rows[j]);
						rows[z].parentNode.removeChild(rows[z]);
						k += 2;
						j -= 2;
					} else {
						rows[j].parentNode.removeChild(rows[j]);
						k += 1;
						j -= 1;
					}
					if(k+j == gesammt) {
						//alert("\tbreak;\nk: " + k + "\nj: " + j + "\ngesammt: " + gesammt);
						break;
					}
				}
			}
		}
	}
	if(k != 0) {
		if(document.URL.match("&mode=combined")) {
			if(pos == 6) {
				if(title == "filterFull") {
					alert(k + "/" + gesammt + " Dörfer mit mehr als " + filterLowerThan + " freien BH-Plätzen ausgeblendet!");
				} else {
					alert(k + "/" + gesammt + " Dörfer mit weniger als " + filterLowerThan + " freien BH-Plätzen ausgeblendet!");
				}
			} else if(pos == 5) {
				alert(k + "/" + gesammt + " Dörfer ohne Forschungsmöglichkeiten ausgeblendet!");
			} else if(pos == 18 && title == "genau") {
				alert(k + "/" + gesammt + " Dörfer mit nicht genau " + filterLowerThan + " Einheiten vom Typ Adelsgeschlecht ausgeblendet!");
			} else if(pos == 18 && title == "min") {
				alert(k + "/" + gesammt + " Dörfer mit weniger als " + filterLowerThan + " Einheiten vom Typ Adelsgeschlecht ausgeblendet!");
			} else if(pos == 18 && title == "max") {
				alert(k + "/" + gesammt + " Dörfer mit mehr als " + filterLowerThan + " Einheiten vom Typ Adelsgeschlecht ausgeblendet!");
			} else {
				alert(k + "/" + gesammt + " Dörfer mit weniger als " + filterLowerThan + " Einheiten vom Typ " + title + " ausgeblendet!");
			}
		} else if(document.URL.match("&type=there")) {
			alert((k/2) + "/" + (gesammt/2) + " Dörfer mit mehr als " + filterLowerThan + " Einheiten vom Typ " + title + " ausgeblendet!");
		} else {
			alert((k/2) + "/" + (gesammt/2) + " Dörfer mit weniger als " + filterLowerThan + " Einheiten vom Typ " + title + " ausgeblendet!");
		}
		srcImg.setAttribute("src",restoreFilterImage );
		srcImg.setAttribute("alt","alle Dörfer anzeigen");
		srcImg.setAttribute("title","alle Dörfer anzeigen");
		srcImg.style.cursor = "pointer";
		srcImg.addEventListener("click",function() { document.location.href=document.location; },false);
	}
}

function readMaRekCookie() {
	var win = window;
	if(typeof unsafeWindow != 'undefined') {
		win = unsafeWindow;
	}

	// MaRek
	var massrecruiting = /massrecruiting=(.*?)(?:;|$)/.exec(document.cookie);
	if(massrecruiting) {
		var value = decodeURIComponent(massrecruiting[1]);
		alertText = value;
	} else if(win.localStorage && win.localStorage.massrecruiting) {
		alertText = decodeURIComponent(win.localStorage.massrecruiting);
	}
	return alertText;
}

function readGruppenAufKarteCookie() {
	var win = window;
	if(typeof unsafeWindow != 'undefined') {
		win = unsafeWindow;
	}

	// GruppenAufKarte
	var settings = { size: 8, position: 1, orientation: 1, border: 1, groups: [] };
	var markedgroups = /markedgroups=(.*?)(?:;|$)/.exec(document.cookie);
	if(markedgroups) {
		var value = decodeURIComponent(markedgroups[1]);
		settings = value;
	} else if(win.localStorage && win.localStorage.markedgroups) {
		settings = decodeURIComponent(win.localStorage.markedgroups);
	}
	if(typeof(settings.length) != 'undefined') {
		//alert('Die Einstellungen für die Markierungen auf der Karte scheinen veraltet zu sein und werden zurückgesetzt. (Das sollte nur ein einziges mal passieren)');
		//settings = { size: 8, position: 1, orientation: 1, border: 1, groups: [] };
		//set_cookie(settings);
	}
	if(typeof(settings.border) == 'undefined') {
		settings.border = 1;
	}
	return settings;
}

function readGruppenAufKarte() {
	//showCookie("GruppenAufKarte");
	showCookie("sdfsd");
}

function readMaRek() {
	showCookie("MaRek");
}

function showCookie(what) {
	var alertText;
	if(what == "MaRek") {
		alertText = readMaRekCookie();
	} else if(what == "GruppenAufKarte") {
		alertText = readGruppenAufKarteCookie();
	} else {
		var str = "hpxdsfmexp\n2.0.10\n"+document.location.host.split('.')[0];+"\n";
		var vals = storage.listValues();
		for(var i = 0; i < vals.length; i++ ) {
			str += vals[i]+":"+storage.getValue(vals[i])+"\n";
		}
		str += "hpxdsfmexp";
		var div = document.getElementById("dsfm_impexp_div");
		showImpExpForm(false);
		document.getElementById("dsfm_impexp_report").value = str;
	}

	// Anzeige
	var textbox = document.getElementById("ausgabebox");
	if(!textbox) {
		var tbodyXP = document.evaluate(XPathTextboxMarekTr, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
		if(!tbodyXP.singleNodeValue) {
			return false;
		}
		var tbody = tbodyXP.singleNodeValue.parentNode;
		var tr1 = document.createElement("tr");
		var tr2 = document.createElement("tr");
		var td = document.createElement("td");
			td.setAttribute("colspan","3");
			td.setAttribute("align","center");
		var strong = document.createElement("strong");
		strong.innerHTML = "momentan gespeicherte Daten:";
		var br = document.createElement("br");
		td.appendChild(br);
		td.appendChild(strong);
		tr1.appendChild(td);
		td = document.createElement("td");
			td.setAttribute("colspan","3");
			td.setAttribute("align","center");
		var textbox = document.createElement("textarea");
			textbox.setAttribute("type","text");
			textbox.setAttribute("cols","50");
			textbox.setAttribute("rows","10");
			textbox.setAttribute("id","ausgabebox");
		td.appendChild(textbox);
		tr2.appendChild(td);
		tbody.appendChild(tr1);
		tbody.appendChild(tr2);
	}
	textbox.value = alertText;
	textbox.focus();
	textbox.select();
}

function saveMaRekCookie(finalRun) {
	alert('currently under developement');
	return false;
	var textbox = document.getElementById("ausgabebox");
	if(!textbox || textbox.value.length == 0) {
		alert("keine Daten zum speichern gefunden");
		return false;
	}
	MarekCookie = textbox.value;
	//alert(MarekCookie);
	if(MaRekCookie.length > 4096) {
		alert("Error: zuviele Gruppeneinstellungen gespeichert");
		return false;
	}
	var tbodyXP = document.evaluate(XPathTextboxMarekTr, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
	if(!tbodyXP.singleNodeValue) {
		return false;
	}
	if(finalRun == false) {
		var tbody = tbodyXP.singleNodeValue.parentNode;
		var tr1 = document.createElement("tr");
		var tr2 = document.createElement("tr");
		var td = document.createElement("td");
			td.setAttribute("colspan","2");
			td.setAttribute("align","center");
		var strong = document.createElement("strong");
		strong.innerHTML = "momentan gespeicherte Daten:";
		var br = document.createElement("br");
		td.appendChild(br);
		td.appendChild(strong);
		tr1.appendChild(td);
		td = document.createElement("td");
			td.setAttribute("colspan","2");
			td.setAttribute("align","center");
		var textbox = document.createElement("textarea");
			textbox.setAttribute("type","text");
			textbox.setAttribute("cols","50");
			textbox.setAttribute("rows","10");
			textbox.setAttribute("id","ausgabebox");
		td.appendChild(textbox);
		tr2.appendChild(td);
		tbody.appendChild(tr1);
		tbody.appendChild(tr2);
		textbox.value = alertText;
		textbox.focus();
	} else {
		MaRekCookie = textbox.value;
		document.cookie = 'massrecruiting=' + encodeURIComponent(MaRekCookie) + '; expires=' + (new Date(2036, 1, 1)).toGMTString() + ';';
		alert('Cookie gespeichert :-)');
	}
}
