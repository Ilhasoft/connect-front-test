<template>
    <div class="weni-org-permissions">
      <div class="weni-org-permissions__field">
        <search-user
          class="weni-org-permissions__input"
          :label="$t('orgs.create.user_search')"
          :placeholder="$t('orgs.create.user_search_description')" />
      </div>
      <div class="weni-org-permissions__list">
        <org-role
          v-for="user in permissions"
          disabled
          :can-delete="false"
          :role="user.role"
          :key="user.uuid"
          :email="user.user__username"
          :name="isOwner(user) ? $t('orgs.you') : user.user__username" />
        <infinite-loading @infinite="fetchPermissions" />
      </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex';
import SearchUser from './searchUser'
import OrgRole from './orgRole.vue';
import InfiniteLoading from '../InfiniteLoading';

export default {
  name: 'OrgPermissions',
  components: {
    OrgRole,
    SearchUser,
    InfiniteLoading,
  },
  props: {
    org: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      permissions: [],
      user: null,
    };
  },
  methods: {
    ...mapActions(['getMembers', 'addAuthorization', 'changeAuthorization', 'removeAuthorization']),
    async fetchPermissions($state) {
       try {
        const response = await this.getMembers({ uuid: this.org.uuid, page: this.page });
        this.page = this.page + 1;
        this.permissions = [...this.permissions, ...response.data.results];
        this.complete = response.data.next == null;
      } catch(e) {
        $state.error();
      } finally {
        if (this.complete) $state.complete();
        else $state.loaded();
      }
    },
    isOwner(user) {
      return user.user__username === this.org.owner.username;
    },
  },
};
</script>

<style lang="scss" scoped>
  @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
  .weni-org-permissions {
    display: flex;
    flex-direction: column;
    &__field {
      display: flex;
      margin: 0 0 $unnnic-spacing-stack-md 0;
    }
    &__input {
      flex: 1;
      margin: 0 $unnnic-inline-sm 0 0;
    }
    &__list {
      flex: 1;
      > *:not(:last-child) {
          margin: 0 0 $unnnic-spacing-stack-md 0;
      }
    }

    &__separator {
      border: 1px solid $unnnic-color-neutral-soft;
      margin: $unnnic-spacing-stack-md 0;
    }

    &__button {
      width: 100%;
    }
  }
</style>