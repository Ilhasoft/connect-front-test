<template>
  <unnnic-modal
    :showModal="open"
    :text="title"
    :scheme="scheme"
    modal-icon="alert-circle-1"
    @close="onClose()">
    <span slot="message" v-html="description" />
    <unnnic-button
      slot="options"
      type="terciary"
      @click="onClose()">
      {{ cancelText }}
    </unnnic-button>
    <unnnic-button
      slot="options"
      :class="`weni-confirm-modal__button--${type}`"
      type="primary"
      @click="onConfirm()">
      {{ confirmText }}
    </unnnic-button>
  </unnnic-modal>
</template>

<script>
import { unnnicModal, unnnicButton } from 'unnic-system-beta';
export default {
  components: { unnnicModal, unnnicButton },
  props: {
    title: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    open: {
      type: Boolean,
      default: null,
    },
    confirmText: {
      type: String,
      default: '',
    },
    cancelText: {
      type: String,
      default: '',
    },
  },
  computed: {
    scheme() {
      if (this.type === 'danger') return 'feedback-red';
      if (this.type === 'alert') return 'feedback-yellow';
      return '';
    },
  },
  methods: {
    onClose() {
      this.$emit('close');
    },
    onConfirm() {
      this.$emit('confirm');
    },
  },
}
</script>

<style lang="scss" scoped>
    @import '~unnic-system-beta/src/assets/scss/unnnic.scss';
    .weni-confirm-modal {
        &__button {
            &--danger {
                background-color: $unnnic-color-feedback-red;
                color: $unnnic-color-neutral-snow;
            }

            &--alert {
                background-color: $unnnic-color-feedback-yellow;
                color: $unnnic-color-neutral-snow;
            }
        }
    }
</style>