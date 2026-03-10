'use client'

import { AssistantChatModal } from '@/components/assistant/AssistantChatModal'
import type { UIMessage } from 'ai'
import type { ProviderCardTranslator } from './types'

type AssistantSavedEvent = {
  modelLabel?: string
  model?: string
  modelId?: string
}

type AssistantModalState = {
  isAssistantOpen: boolean
  closeAssistant: () => void
  handleAssistantSend: () => Promise<void> | void
  assistantSavedEvent: AssistantSavedEvent | null
  assistantChat: {
    messages: UIMessage[]
    input: string
    pending: boolean
    error?: { message?: string } | null
    setInput: (value: string) => void
  }
}

interface ModelTemplateAssistantModalProps {
  t: ProviderCardTranslator
  state: AssistantModalState
}

function getAssistantSavedModelLabel(savedEvent: AssistantSavedEvent): string {
  return savedEvent.modelLabel || savedEvent.model || savedEvent.modelId || ''
}

export function ModelTemplateAssistantModal({ t, state }: ModelTemplateAssistantModalProps) {
  const savedEvent = state.assistantSavedEvent
  const completed = savedEvent !== null
  const savedModelLabel = savedEvent ? getAssistantSavedModelLabel(savedEvent) : ''

  return (
    <AssistantChatModal
      open={state.isAssistantOpen}
      title={t('assistantTitle')}
      subtitle={t('assistantSubtitle')}
      closeLabel={t('close')}
      userLabel={t('you')}
      assistantLabel="AI"
      reasoningTitle={t('assistantReasoningTitle')}
      reasoningExpandLabel={t('assistantReasoningExpand')}
      reasoningCollapseLabel={t('assistantReasoningCollapse')}
      emptyAssistantMessage={t('assistantWelcome')}
      inputPlaceholder={t('assistantInputPlaceholder')}
      sendLabel={t('assistantSend')}
      pendingLabel={t('thinking')}
      messages={state.assistantChat.messages}
      input={state.assistantChat.input}
      pending={state.assistantChat.pending}
      completed={completed}
      completedTitle={t('assistantCompletedTitle')}
      completedMessage={t('assistantCompletedMessage', { model: savedModelLabel })}
      errorMessage={state.assistantChat.error?.message}
      onClose={state.closeAssistant}
      onInputChange={state.assistantChat.setInput}
      onSend={() => void state.handleAssistantSend()}
    />
  )
}
