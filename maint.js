let anneeChoisie = "2011" // pour demarrer on code en dur une année à afficher

d3.csv("mesDonnes.csv").then(function(data) {

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
    var cleanData = data.filter( TODO ); // TODO ne garder que les lignes où (L_TYP_REG_DECHET === "DEEE")

    color.domain([0, 10000]);

    d3.json("departements-version-simplifiee.geojson").then(function(json) {
        //On fusionne les donnees avec le GeoJSON des departements

        //On parcours les departements du GeoJSON un par un
        for (var j = 0; j < json.features.length; j++) {
			var departement = json.features.TODO // TODO

            // find permet d'eviter de faire une boucle sur toutes les donnees 
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find#find_an_object_in_an_array_by_one_of_its_properties
            var anneeDepChoisi = cleanData.find(function(row) {
                return TODO; // find renvoie la ligne du tableau si la fonction qu'on lui passe en argument renvoie True.    
            })
            json.features[j].properties.value = anneeDepChoisi.hosp;
	  }

      // on dessine
      svg.selectAll("path")
      ...
        .style("fill", function(d) {
              var value = d.properties.value;
              ...
      });
    });
});
