// Demande le lancement de l'exécution quand toute la page Web sera chargée
window.addEventListener('load', go);

// SAM Design Pattern : http://sam.js.org/
let actions, model, state, view;

// Point d'entrée de l'application
function go() {
  console.log('GO !');

  // Récupère l'état de l'interface
  const displayMode     = document.querySelector('select').value;
  const filterString    = document.querySelector('input' ).value;
  const includesRegions = document.querySelector('input[type="checkbox"]').checked;

  // Lance l'initialisation de l'application
  actions.initAndGo({departments: départements, displayMode, filterString, includesRegions, filterMethod: 'filter'});

  // Astuce : let val = 3; let obj1 = {val: val}; let obj2 = {val} // obj1 == obj2 == {val: 3}
}

//------------------------------------------------------------------ Actions ---
// Actions appelées dans le code HTML quand des événements surviennent
//
actions = {

  initAndGo: function (data) {
    model.samPresent({do:'init', ...data});
  },

  // Demande au modèle de changer le mode d'affichage.
  // Lui envoit pour cela un objet avec une propriété 'mode' et la valeur proposée.
  changeMode: function (data) {
    let displayMode = data.e.target.value;
    model.samPresent({do: 'changeMode', displayMode: displayMode});
  },

  // Demande au modèle de changer le filtre courant.
  filter: function (data) {
    let filterString = data.e.target.value;
    model.samPresent({do: 'filter', filterString: filterString});
  },

  // Demande au modèle d'activer ou non le filtrage sur les régions.
  includesRegions: function (data) {
    let isChecked = data.e.target.checked;
    model.samPresent({do: 'includesRegions', includesRegions: isChecked});
  }
};
//-------------------------------------------------------------------- Model ---
// Unique source de vérité de l'application
//
model = {
  departments: [], // tableau contenant données sur les départements
  displayMode: '',        // mode d'affichage ['asList_for', 'asList_map', 'asTable_for', 'asTable_map', 'asTags']
  filterMethod: '',// méthode de filtrage ['for' ou 'filter"]
  filterString: '',   // filtre à appliquer aux données sur les départements
  includesRegions: false, // inclure les régions dans le filtrage

  // Demande au modèle de se mettre à jour en fonction des données qu'on
  // lui présente.
  // l'argument data est un objet confectionné dans les actions.
  // Les propriétés de data désignent la modification à faire sur le modèle.
  samPresent: function (data) {
    switch (data.do) {
      case 'init':
        this.departments     = data.departments;
        this.displayMode     = data.displayMode;
        this.filterString    = data.filterString;
        this.includesRegions = data.includesRegions;
        this.filterMethod    = data.filterMethod;
        break;
      case 'changeMode':
        this.displayMode = data.displayMode;
        break;
      case 'filter':
        this.filterString = data.filterString;
        break;
      case 'includesRegions':
        this.includesRegions = data.includesRegions;
        break;
    }

    // Demande à l'état de l'application de prendre en compte la modification
    // du modèle
    state.samUpdate(this);
  }
};
//-------------------------------------------------------------------- State ---
// État de l'application avant affichage
//
state = {
  currentFilterString: undefined, // le =
  samUpdate: function (model) {
    
    // filtre les données si les informations de filtre ont changé
    if (this.currentFilterString !== model.filterString || this.currentIncludesRegions !== model.includesRegions) {
      this.currentFilterString    = model.filterString;
      this.currentIncludesRegions = model.includesRegions;
      switch(model.filterMethod) {
        case 'for'   : this.departmentsFilt = this.filterDepartments_for   (model.departments); break;
        case 'filter': this.departmentsFilt = this.filterDepartments_filter(model.departments); break;
      }
    }

    this.samRepresent(model);
    // this.samNap(model);
  },

  // Filtrage des départements

  // version avec boucle for
  filterDepartments_for: function (depArray) {
    if (this.currentFilterString == '') return depArray;

    let filtered = [];
    let list = depArray;
    let filt = this.currentFilterString.toUpperCase();

    for (let i = 0; i < list.length; i++) {
      if (this.currentIncludesRegions) {
        if (list[i][2].toUpperCase().indexOf(filt) > -1) {
          filtered.push(list[i]);
        }
      }
      if (list[i][0].toUpperCase().indexOf(filt) > -1) {
        filtered.push(list[i]);
      }
    }

    return filtered;
  },
  // version avec filter
  filterDepartments_filter: function (depArray) {
    if (this.currentFilterString == '') return depArray;

    let list = depArray;
    let filt = this.currentFilterString.toUpperCase();

    return list.filter((v, i, a) => {
      if (this.currentIncludesRegions) {
        return list[i][0].toUpperCase().indexOf(filt) > -1 || list[i][2].toUpperCase().indexOf(filt) > -1;
      }
      return list[i][0].toUpperCase().indexOf(filt) > -1;
    })

  },

  // Met à jour l'état de l'application, construit le code HTML correspondant,
  // et demande son affichage.
  samRepresent: function (model) {
    let representation = 'Oops, should not see this...';

    // Génère le HTML pour afficher le nombre d'occurences.
    representation = view.occurences(model, this);
    // Génère le HTML correspondant au mode d'afficahge courant.
    switch (model.displayMode) {
      case "asList_for":  representation += view.asList_for(model, this);  break;
      case "asList_map":  representation += view.asList_map(model, this);  break;
      case "asTable_for": representation += view.asTable_for(model, this); break;
      case "asTable_map": representation += view.asTable_map(model, this); break;
      case "asTags":      representation += view.asTags(model, this);      break;
      default:            representation += view.error(model.displayMode);
    }
    // Appel l'affichage du HTML généré.
    view.samDisplay(representation);
  },

};
//--------------------------------------------------------------------- View ---
// Génération de portions en HTML et affichage
//
view = {

  // Injecte le HTML dans une balise de la page Web.
  samDisplay: function (representation) {
    const app = document.getElementById('app');
    app.innerHTML = representation;
  },

  // Renvoit le HTML pour l'afficage du nombre d'occurences.
  occurences: function (model, state) {
    let nbOcc = state.departmentsFilt.length;  // TODO: Quel est le nombre d'éléments dans le tableau filtré ?
    return `
        <p>${nbOcc} occurence</p>
    `;
  },

  // Renvoit le HTML pour l'affichage des départements sous forme d'une liste.
  // Version avec une boucle for
  asList_for: function (model, state) {
    let items = '';
    let a = state.departmentsFilt;
    for (let i = 0; i < a.length; i++) {
      const dep = a[i][0];
      const reg = a[i][2];
      items += `<li><b>${dep}</b> (${reg})</li>`
    }

    return `
        <ul>
          ${items}
        </ul>
      `;
  },

  // Renvoit le HTML pour l'affichage des départements sous forme d'une liste.
  // Version avec une fonction map
  asList_map: function (model, state) {
    return `
        <ul>
          ${state.departmentsFilt.map((v) => `<li><b>${v[0]}</b> (${v[2]})</li>`).join('')}
        </ul>
      `;
  },

  asTable_for: function (model, state) {
    // for loop version - HTML table generation with filtered elements
    let items = '';
    let a = state.departmentsFilt;
    for (let i = 0; i < a.length; i++) {
      const dep = a[i][0];
      const num = a[i][1];
      const reg = a[i][2];
      items += `<tr>
                  <td style="border: 1px solid black">${num}</td>
                  <td colspan="3" style="border: 1px solid black; font-weight: bold;">${dep}</td>
                  <td colspan="3" style="border: 1px solid black">${reg}</td>
                </tr>`
    }
    return `
      <table>
        <tr>
          <td style="border: 1px solid black; font-weight: bold;">N°</td>
          <td colspan="3" style="border: 1px solid black; font-weight: bold;">Departements</td>
          <td colspan="3" style="border: 1px solid black; font-weight: bold;">Regions</td>
        </tr>
        ${items}
      </table>
    `;
  },

  asTable_map: function (model, state) {
    // fmap function version - HTML table generation with filtered elements
    return `
      <table>
        <tr>
          <td style="border: 1px solid black; font-weight: bold;">N°</td>
          <td colspan="3" style="border: 1px solid black; font-weight: bold;">Departements</td>
          <td colspan="3" style="border: 1px solid black; font-weight: bold;">Regions</td>
        </tr>
        ${state.departmentsFilt.map((v) => `<tr>
                                          <td style="border: 1px solid black;">${v[1]}</td>
                                          <td colspan="3" style="border: 1px solid black; font-weight: bold;">${v[0]}</td>
                                          <td colspan="3" style="border: 1px solid black;">${v[2]}</td>
                                        </tr>`).join('')}
      </table>
    `;
  },

  
  asTags: function(model, state){
    return state.departmentsFilt.map((v) => `<span style="background-color: black; color: white; padding: 0px 3px;">${v[0]}</span>`).join(' ');
  },

  error: function(caseValue) {
    return `
      <p>Problème : <b>state.representation(model)</b> : que faire avec "${caseValue}" ?</p>
    `;
  }
};
