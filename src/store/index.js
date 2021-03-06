import Vue from 'vue';
import Vuex from 'vuex';

import Account from './account';
import Dashboard from './dashboard';
import Org from './org';
import Users from './users'

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    Dashboard,
    Org,
    Account,
    Users,
  },
});

store.dispatch('retriveCurrentOrgId');

export default store;
