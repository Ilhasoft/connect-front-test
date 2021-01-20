<template>
  <div class="unnic-grid-giant weni-account">
    <div class="unnic-grid-span-4 weni-account__card">
        <unnic-card class="weni-account__card__item"
        type="account"
        icon="single-neutral-2"
        :title="$t('account.profile')"
        :description="$t('account.profile_text')" />
    </div>
    <div class="unnic-grid-span-8">
        <div class="weni-account__header">
            <div class="weni-account__header__picture" :style="imageBackground">
                <unnic-icon 
                  v-if="!formData.photo" 
                  icon="single-neutral-2" />
            </div>
            <div class="weni-account__header__text">
                <div class="weni-account__header__text__title"> 
                  {{ profile ? profile.first_name : '' }} {{ profile ? profile.last_name : '' }}
                </div>
                <div class="weni-account__header__text__subtitle"> 
                  {{ profile ? `@${profile.username}` : '' }}
                </div>
            </div>
            <div class="weni-account__field__group">
                <unnic-button
                  :disabled="loadingPicture"
                  size="small"
                  type="terciary"
                  icon-left="delete-1"
                  @click="onDeletePicture()" >
                  {{ $t('account.reset') }}
                </unnic-button>
                <unnic-button
                  :disabled="loadingPicture"
                  size="small"
                  type="terciary"
                  @click="onFileUpload()">
                  {{ $t('account.change_picture') }}
                </unnic-button>
                <input
                  ref="imageInput"
                  :hidden="true"
                  type="file"
                  accept="image/*"
                  @change="onChangePicture">
            </div>
        </div>
        <div class="weni-account__header__info"> 
            <div class="weni-account__header__info__separator" /> 
            <div> Images by Coisinha </div> 
        </div>
        <div class="weni-account__field">
            <unnic-input
              v-for="field in formScheme"
              :key="field.key"
              v-model="formData[field.key]"
              :icon-left="field.icon"
              :type="error[field.key] ? 'error' : 'normal'"
              :message="error[field.key]"
              :label="$t(`account.fields.${field.key}`)" />
            <div class="weni-account__field__group">
              <unnic-input
              v-for="field in groupScheme"
              :key="field.key" :icon-left="field.icon"
              :type="error[field.key] ? 'error' : 'normal'"
              :message="error[field.key]"
              v-model="formData[field.key]"
              :label="$t(`account.fields.${field.key}`)" />
              <unnic-input
                v-model="password"
                icon-left="single-neutral-actions-1"
                :label="$t('account.fields.password')"
                :type="error.password ? 'error' : 'normal'"
                :message="message(error.password)"
                native-type="password"
                toggle-password />
            </div>
        </div>
        <div class="weni-account__field__group">
            <unnic-button
              :disabled="isLoading || changedFields().length === 0" 
              @click="onSave()"> 
              {{ $t('account.save') }} 
            </unnic-button>
            <unnic-button
              class="weni-account__danger"
              type="terciary"
              :disabled="isLoading"
              @click="onDeleteProfile()">
              {{ $t('account.delete_account') }}
            </unnic-button>
        </div>
    </div>
    <unnic-modal
      :show-modal="modal.open"
      :text="modal.title"
      closeIcon
      modal-icon="alert-circle-1"
      :scheme="modal.scheme || 'feedback-yellow'"
      @close="modal.open = false">
        <div v-html="modal.text" slot="message" />
        <div
          v-if="modal.requirePassword"
          slot="message"> 
          <unnic-input
            :label="$t('account.password_confirm')"
            v-model="confirmPassword"
            native-type="password"
            toggle-password />
        </div>
        <unnic-button type="terciary" slot="options" @click="modal.open = false"> {{ $t('account.cancel') }} </unnic-button>
        <unnic-button
          type="terciary"
          slot="options"
          @click="modal.onConfirm()">
            {{ modal.confirmText }}
          </unnic-button>
    </unnic-modal>
  </div>
</template>

<script>
import unnic from 'unnic-system-beta';
import account from '../api/account.js';

export default {
  name: 'Account',
  components: {
    unnicCard: unnic.UnnicCard,
    unnicInput: unnic.UnnicInput,
    unnicButton: unnic.UnnicButton,
    UnnicIcon: unnic.UnnicIcon,
    UnnicModal: unnic.UnnicModal,
  },
  data() {
    return {
      loading: false,
      loadingPicture: false,
      loadingPassword: false,
      showSaveModal: false,
      error: {},
      formScheme: [
        { key: 'first_name', icon: 'single-neutral-actions-1' },
        { key: 'last_name', icon: 'single-neutral-actions-1' },
        { key: 'email', icon: 'email-action-unread-1' },
      ],
      groupScheme: [
        { key: 'username', icon: 'read-email-at-1' },
      ],
      formData: {
        email: '',
        first_name: '',
        last_name: '',
        username: '',
        photo: null,
      },
      password: null,
      confirmPassword: null,
      profile: null,
      picture: null,
      modal: {
        open: false,
        requirePassword: false,
        scheme: 'feedback-red',
        title: '',
        text: '',
        onConfirm: () => {},
        confirmText: '',
      },
    };
  },
  computed: {
    imageBackground() {
      const url = this.temporaryPicture || this.formData.photo;
      return `background-image: url('${url}')`;
    },
    isLoading() {
      return this.loading || this.loadingPassword;
    },
    temporaryPicture() {
      if (!this.picture) return null;
      return URL.createObjectURL(this.picture);
    },
  },
  mounted() {
    this.getProfile();
  },
  methods: {
    changedFields() {
      return [ ...this.formScheme, this.groupScheme ]
      .filter((item) => {
        if (!this.profile) return this.formData[item.key];
        return this.formData[item.key] !== this.profile[item.key]
      }).map((item) => item.key);
    },
    changedFieldNames() {
      return this.changedFields().map((key) => this.$t(`account.fields.${key}`)).join('<br>');
    },
    message(object) {
      if (Array.isArray(object)) return object.join(', ');
      return object;
    },
    onFileUpload() {
      this.$refs.imageInput.click();
    },
    onSave() {
      this.modal = {
        open: true,
        title: this.$t('account.save'),
        text: `${this.$t('account.save_confirm')} <br> ${this.changedFieldNames()}` ,
        confirmText: this.$t('account.save'),
        onConfirm: () => {
          this.updateProfile()
        },
      }
    },
    async getProfile() {
      this.loading = true;
      try {
        const response = await account.profile();
        this.profile = { ...response.data };
        this.formData = { ...response.data };
      } catch(e) {
        this.onError(this.$t('account.profile_error'));
      } finally {
        this.loading = false;
      }
    },
    async updateProfile() {
      this.error = {};
      this.modal.open = false;
      if (this.password) this.updatePassword();
      this.loading = true;
      const data = this.changedFields().reduce((object, key) => { 
        object[key] = this.formData[key]; 
        return object; 
      }, {});
      try {
        const response = await account.updateProfile(data);
        this.profile = response.data;
        this.onSuccess('Updated Profile');
      } catch(e) {
        this.onError('Could not update profile');
      } finally {
        this.loading = false;
      }
    },
    async updatePicture() {
      if (!this.picture) return;
      this.loadingPicture = true;
      try {
        await account.updatePicture(this.picture);
        this.formData.photo = URL.createObjectURL(this.picture);
        this.onSuccess(this.$t('account.picture_update_success'));
      } catch(e) {
        this.onError(this.$t('account.picture_update_error'));
      } finally {
        this.picture = null;
        this.loadingPicture = false;
      }
    },
    async updatePassword() {
      this.loadingPassword = true;
      try {
        await account.updatePassword(this.password);
        this.password = null;
        this.onSuccess(this.$t('account.password_update_success'));
      } catch(error) {
        this.error = { ...this.error, ...error.response.data }
        this.onError(this.$t('account.password_update_error'));
      } finally {
        this.loadingPassword = false;
      }
    },
    onSuccess(text) {
      unnic.callAlert({ props: {
        text,
        title: 'Success',
        scheme: 'feedback-green',
        icon: 'alert-circle-1',
        closeText: this.$t('close'),
      }, seconds: 3 });
    },
    onError(text) {
      unnic.callAlert({ props: {
        text,
        title: 'Error',
        icon: 'check-circle-1-1',
        scheme: 'feedback-red',
        closeText: this.$t('close'),
      }, seconds: 3 });
    },
    onChangePicture(element) {
      const file = element.target.files[0];
      this.picture = file;
      this.updatePicture();
    },
    onDeletePicture() {
      this.modal = {
        open: true,
        title: this.$t('account.reset'),
        text: this.$t('account.reset_confirm'),
        confirmText: this.$t('account.reset'),
        onConfirm: () => {
          this.modal.open = false;
          this.deletePicture()
        },
      };
    },
    onDeleteProfile() {
      this.confirmPassword = null;
      this.modal = {
        open: true,
        title: this.$t('account.delete_account'),
        text: this.$t('account.delete_account_confirm'),
        confirmText: this.$t('account.delete_account'),
        requirePassword: true,
        onConfirm: () => {
          this.modal.open = false;
          this.deleteProfile();
        },
      };
    },
    async deleteProfile() {
      this.modal.open = false;
      this.loading = true;
      const confirmPassword = this.confirmPassword;
      this.confirmPassword = null;
      try {
        await account.deleteProfile(confirmPassword);
        window.parent.Luigi.auth().logout();
      } catch(e) {
        this.onError(this.$t('account.delete_account_error'));
      } finally {
        this.loading = false;
      }
    },
    async deletePicture() {
      this.modal.open = false;
      this.loadingPicture = true;
      try {
        await account.removePicture();
        this.formData.photo = null;
        this.picture = null;
        this.onSuccess(this.$t('account.delete_picture_success'));
      } catch(e) {
        this.onError(this.$t('account.delete_picture_error'));
      } finally {
        this.loadingPicture = false;
      }
    },
  }
}
</script>

<style lang="scss">
@import '~unnic-system-beta/src/assets/scss/unnic.scss';

    .weni-account {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
        &__card {
            border-right: 2px $unnic-color-neutral-soft solid;
            padding-right: 16px;
        }

        &__field {
            margin-bottom: $unnic-spacing-stack-md !important;
            &__group {
                display: flex;

                button {
                    width: 100%;
                }

                > * {
                    flex: 1;
                }

                > :not(:last-child) {
                    margin-right: 1rem;
                }
            }
        }

        &__danger {
            color: $unnic-color-feedback-red !important;
        }
        
        &__header {
            display: flex;
            font-family: $unnic-font-family-primary;
            border-radius: $unnic-border-radius-sm;
            padding: $unnic-squish-lg;
            background-color: $unnic-color-brand-weni;
            overflow: hidden;

            button {
              background-color: $unnic-color-background-snow;
            }

            &__text {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                
                &__title {
                    font-size: $unnic-font-size-title-sm;
                }
                &__subtitle {
                    font-size: $unnic-font-size-body-lg;
                    color: $unnic-color-neutral-dark;
                }
            }

            &__info {
                display: flex;
                align-items: center;
                color: $unnic-color-neutral-clean;
                font-size: $unnic-font-size-body-sm;
                &__separator {
                    flex: 1;
                    border: 1px solid $unnic-color-neutral-soft;
                    margin-right: $unnic-inline-nano;
                }
            }

            &__picture {
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: $unnic-color-background-snow;
                color: $unnic-color-neutral-clean;
                height: $unnic-avatar-size-md;
                width: $unnic-avatar-size-md;
                border-radius: 50%;
                margin-right: $unnic-inline-sm;
                background-size: cover;
                background-position: center;
            }
        }
    }
</style>