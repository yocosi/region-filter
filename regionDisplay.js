// Lance l'exécution quand tout est chargé
window.addEventListener('load', go);

// SAM Design Pattern
let actions, model, state, view;

// Point d'entrée de l'application
function go() {
  console.log('GO !');

  model.init({ departments: départements, mode: 'asList_for' });
  state.samRender(model);
}

//------------------------------------------------------------------ Actions ---
// Actions lancées par des événements
//
actions = {

  changeMode: function (data) {
    let selectedMode = data.e.target.value;
    model.samPresent({ mode: selectedMode });
  },

  filter: function (data) {
    let filterValue = data.e.target.value;
    model.samPresent({ filter: filterValue });
  },

  filterRegions: function (data) {
    let checkValue = data.e.target.checked;
    model.samPresent({ filterRegions: checkValue });
  }
};
//-------------------------------------------------------------------- Model ---
// Unique source de vérité de l'application
//
model = {
  departments: [], // tableau contenant données sur les départements
  mode: '',        // mode de rendu 'asList_for', 'asList_map', 'asTable_for'...
  depFilter: '',   // filtre à appliquer aux données sur les départements
  filterRegions: false,  // inclure les régions dans le filtrage

  init: function (data) {
    this.departments = data.departments;
    this.mode = data.mode;
  },

  samPresent: function (data) {
    const has = Object.prototype.hasOwnProperty;   // test si la propriété
    // d'un objet est présente
    if (has.call(data, 'mode')) {
      this.mode = data.mode;
    }

    if (has.call(data, 'filter')) {
      this.depFilter = data.filter;
    }

    if (has.call(data, 'filterRegions')) {
      this.filterRegions = data.filterRegions;
    }

    state.samRender(this);
  }
};
//-------------------------------------------------------------------- State ---
// Application state before displaying
//
state = {
  currentFilter: undefined,         // Current filter applied to departments
  currentFilterRegions: undefined,  // Include region filter or not
  depFiltered: [],                  // Filtered versions of departments

  samRender: function (model) {
    this.samRepresentAndDisplay(model);
    // this.samNap(model);
  },

  samRepresentAndDisplay: function (model) {
    let representation = 'Oops, should not see this...';

    if (this.currentFilter !== model.depFilter
      || this.currentFilterRegions !== model.filterRegions) {
      this.currentFilter = model.depFilter;
      this.currentFilterRegions = model.filterRegions;
      // Here you choose the filter fonction that you prefer
      // this.depFiltered = this.filterDepartments_for(model.departments);
      this.depFiltered = this.filterDepartments_filter(model.departments);
    }

    representation = view.occurences(model, this);

    switch (model.mode) {
      case "asList_for":
        representation += view.asList_for(model, this);
        break;
      case "asList_map":
        representation += view.asList_map(model, this);
        break;
      case "asTable_for":
        representation += view.asTable_for(model, this);
        break;
      case "asTable_map":
        representation += view.asTable_map(model, this);
        break;
      default:
        representation += view.error(model.mode);
    }
    view.samDisplay(representation);
  },

  // Departments filter functions

  // For loop version
  filterDepartments_for: function (depArray) {
    if (this.currentFilter == '') return depArray;

    let filtered = [];
    let list = depArray;
    let filt = this.currentFilter.toUpperCase();

    for (let i = 0; i < list.length; i++) {
      if (this.currentFilterRegions) {
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

  // Filter function version
  filterDepartments_filter: function (depArray) {
    if (this.currentFilter == '') return depArray;

    let list = depArray;
    let filt = this.currentFilter.toUpperCase();

    return list.filter((v, i, a) => {
      if (this.currentFilterRegions) {
        return list[i][0].toUpperCase().indexOf(filt) > -1 || list[i][2].toUpperCase().indexOf(filt) > -1;
      }
      return list[i][0].toUpperCase().indexOf(filt) > -1;
    })

  }
};
//--------------------------------------------------------------------- View ---
// HTML generation and displaying
//
view = {

  samDisplay: function (representation) {
    const app = document.getElementById('app');
    app.innerHTML = representation;
  },

  occurences: function (model, state) {
    let nbOcc = state.depFiltered.length;  // How many elements are there in the filtered array ?
    return `
        <p>${nbOcc} occurence</p>
    `;
  },

  asList_for: function (model, state) {
    let items = '';
    let a = state.depFiltered;
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

  asList_map: function (model, state) {
    return `
        <ul>
          ${state.depFiltered.map((v) => `<li><b>${v[0]}</b> (${v[2]})</li>`).join('')}
        </ul>
      `;
  },

  asTable_for: function (model, state) {
    // for loop version - HTML table generation with filtered elements
    let items = '';
    let a = state.depFiltered;
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
        ${state.depFiltered.map((v) => `<tr>
                                          <td style="border: 1px solid black;">${v[1]}</td>
                                          <td colspan="3" style="border: 1px solid black; font-weight: bold;">${v[0]}</td>
                                          <td colspan="3" style="border: 1px solid black;">${v[2]}</td>
                                        </tr>`).join('')}
      </table>
    `;
  },

  error: function (caseValue) {
    return `
      <p>Problème : <b>state.representation(model)</b> : que faire avec "${caseValue}" ?</p>
    `;
  }
};
