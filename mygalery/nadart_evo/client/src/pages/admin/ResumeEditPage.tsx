import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import {
  useResume,
  useUpdateResumeContent,
  useCreateTimelineEntry,
  useUpdateTimelineEntry,
  useDeleteTimelineEntry,
  useCreateExpertiseArea,
  useUpdateExpertiseArea,
  useDeleteExpertiseArea,
} from '../../hooks/useResume'
import type { TimelineEntry, ExpertiseArea } from '../../types'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

type Tab = 'content' | 'timeline' | 'expertise'

export default function ResumeEditPage() {
  const [activeTab, setActiveTab] = useState<Tab>('content')
  const { data: resume, isLoading } = useResume()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-nadart-text-primary mb-8">Edit Resume</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-nadart-accent/20">
        {[
          { id: 'content', label: 'Content', icon: 'fas fa-file-alt' },
          { id: 'timeline', label: 'Timeline', icon: 'fas fa-clock' },
          { id: 'expertise', label: 'Expertise', icon: 'fas fa-star' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={`px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'text-nadart-text-primary border-nadart-text-primary'
                : 'text-nadart-text-secondary border-transparent hover:text-nadart-text-primary'
            }`}
          >
            <i className={`${tab.icon} mr-2`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && <ContentSection resume={resume} />}
      {activeTab === 'timeline' && <TimelineSection timeline={resume?.timeline || []} />}
      {activeTab === 'expertise' && <ExpertiseSection expertise={resume?.expertise || []} />}
    </div>
  )
}

// Content Section
function ContentSection({ resume }: { resume: ReturnType<typeof useResume>['data'] }) {
  const updateContent = useUpdateResumeContent()
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<{ content: string }>()

  const contentSections = [
    { key: 'artist_statement_en', label: 'Artist Statement (English)' },
    { key: 'artist_statement_ar', label: 'Artist Statement (Arabic)' },
    { key: 'artistic_philosophy_en', label: 'Artistic Philosophy (English)' },
    { key: 'artistic_philosophy_ar', label: 'Artistic Philosophy (Arabic)' },
  ]

  const openEdit = (key: string) => {
    reset({ content: resume?.content[key] || '' })
    setEditingKey(key)
  }

  const onSubmit = (data: { content: string }) => {
    if (editingKey) {
      updateContent.mutate(
        { key: editingKey, content: data.content },
        { onSuccess: () => setEditingKey(null) }
      )
    }
  }

  return (
    <div className="space-y-6">
      {contentSections.map((section) => (
        <motion.div
          key={section.key}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-nadart-text-primary">{section.label}</h3>
            <Button variant="ghost" size="sm" onClick={() => openEdit(section.key)}>
              <i className="fas fa-edit mr-2" />
              Edit
            </Button>
          </div>
          <p className={`text-nadart-text-secondary whitespace-pre-line ${
            section.key.includes('_ar') ? 'font-arizonia text-right' : ''
          }`} dir={section.key.includes('_ar') ? 'rtl' : 'ltr'}>
            {resume?.content[section.key] || <span className="opacity-50">No content yet</span>}
          </p>
        </motion.div>
      ))}

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingKey}
        onClose={() => setEditingKey(null)}
        title={`Edit ${contentSections.find(s => s.key === editingKey)?.label}`}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Textarea
            rows={10}
            placeholder="Enter content..."
            className={editingKey?.includes('_ar') ? 'font-arizonia text-right' : ''}
            dir={editingKey?.includes('_ar') ? 'rtl' : 'ltr'}
            {...register('content')}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setEditingKey(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateContent.isPending}>
              Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

// Timeline Section
function TimelineSection({ timeline }: { timeline: TimelineEntry[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<TimelineEntry | null>(null)
  const [deleting, setDeleting] = useState<TimelineEntry | null>(null)

  const createEntry = useCreateTimelineEntry()
  const updateEntry = useUpdateTimelineEntry()
  const deleteEntry = useDeleteTimelineEntry()

  const { register, handleSubmit, reset } = useForm<{
    date_range: string
    title: string
    description: string
    items: string
  }>()

  const openCreate = () => {
    reset({ date_range: '', title: '', description: '', items: '' })
    setEditing(null)
    setIsModalOpen(true)
  }

  const openEdit = (entry: TimelineEntry) => {
    reset({
      date_range: entry.date_range,
      title: entry.title,
      description: entry.description || '',
      items: entry.items?.join('\n') || '',
    })
    setEditing(entry)
    setIsModalOpen(true)
  }

  const onSubmit = (data: { date_range: string; title: string; description: string; items: string }) => {
    const payload = {
      date_range: data.date_range,
      title: data.title,
      description: data.description || null,
      items: data.items ? data.items.split('\n').filter(Boolean) : null,
      display_order: editing?.display_order ?? timeline.length,
    }

    if (editing) {
      updateEntry.mutate(
        { id: editing.id, data: payload },
        { onSuccess: () => { setIsModalOpen(false); setEditing(null) } }
      )
    } else {
      createEntry.mutate(payload, {
        onSuccess: () => { setIsModalOpen(false) }
      })
    }
  }

  const handleDelete = () => {
    if (deleting) {
      deleteEntry.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}>
          <i className="fas fa-plus mr-2" />
          Add Entry
        </Button>
      </div>

      <div className="space-y-4">
        {timeline.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-nadart-accent-success font-medium">{entry.date_range}</span>
                <h3 className="text-lg text-nadart-text-primary mt-1">{entry.title}</h3>
                {entry.description && (
                  <p className="text-nadart-text-secondary text-sm mt-2">{entry.description}</p>
                )}
                {entry.items && entry.items.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm text-nadart-text-muted">
                    {entry.items.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(entry)}
                  className="p-2 text-nadart-text-secondary hover:text-nadart-text-primary"
                >
                  <i className="fas fa-edit" />
                </button>
                <button
                  onClick={() => setDeleting(entry)}
                  className="p-2 text-nadart-text-secondary hover:text-nadart-accent-error"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Timeline Entry' : 'Add Timeline Entry'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Date Range" placeholder="2022 - 2024" {...register('date_range')} />
          <Input label="Title" placeholder="Entry title" {...register('title')} />
          <Textarea label="Description" rows={2} {...register('description')} />
          <Textarea
            label="Items (one per line)"
            rows={3}
            placeholder="First item&#10;Second item"
            {...register('items')}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createEntry.isPending || updateEntry.isPending}>
              {editing ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Entry"
        message={`Delete "${deleting?.title}"?`}
        isLoading={deleteEntry.isPending}
      />
    </div>
  )
}

// Expertise Section
function ExpertiseSection({ expertise }: { expertise: ExpertiseArea[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<ExpertiseArea | null>(null)
  const [deleting, setDeleting] = useState<ExpertiseArea | null>(null)

  const createArea = useCreateExpertiseArea()
  const updateArea = useUpdateExpertiseArea()
  const deleteArea = useDeleteExpertiseArea()

  const { register, handleSubmit, reset } = useForm<{
    icon: string
    title: string
    description: string
  }>()

  const openCreate = () => {
    reset({ icon: 'fas fa-paint-brush', title: '', description: '' })
    setEditing(null)
    setIsModalOpen(true)
  }

  const openEdit = (area: ExpertiseArea) => {
    reset({
      icon: area.icon,
      title: area.title,
      description: area.description || '',
    })
    setEditing(area)
    setIsModalOpen(true)
  }

  const onSubmit = (data: { icon: string; title: string; description: string }) => {
    const payload = {
      ...data,
      description: data.description || null,
      display_order: editing?.display_order ?? expertise.length,
    }

    if (editing) {
      updateArea.mutate(
        { id: editing.id, data: payload },
        { onSuccess: () => { setIsModalOpen(false); setEditing(null) } }
      )
    } else {
      createArea.mutate(payload, {
        onSuccess: () => { setIsModalOpen(false) }
      })
    }
  }

  const handleDelete = () => {
    if (deleting) {
      deleteArea.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <Button onClick={openCreate}>
          <i className="fas fa-plus mr-2" />
          Add Expertise
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {expertise.map((area, index) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card p-6 text-center"
          >
            <i className={`${area.icon} text-3xl text-nadart-text-primary mb-4`} />
            <h3 className="font-medium text-nadart-text-primary">{area.title}</h3>
            {area.description && (
              <p className="text-sm text-nadart-text-secondary mt-2">{area.description}</p>
            )}
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={() => openEdit(area)}
                className="p-2 text-nadart-text-secondary hover:text-nadart-text-primary"
              >
                <i className="fas fa-edit" />
              </button>
              <button
                onClick={() => setDeleting(area)}
                className="p-2 text-nadart-text-secondary hover:text-nadart-accent-error"
              >
                <i className="fas fa-trash" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditing(null) }}
        title={editing ? 'Edit Expertise' : 'Add Expertise'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Icon Class" placeholder="fas fa-paint-brush" {...register('icon')} />
          <p className="text-xs text-nadart-text-muted -mt-2">
            Use <a href="https://fontawesome.com/icons" target="_blank" rel="noopener noreferrer" className="underline">Font Awesome</a> icon classes
          </p>
          <Input label="Title" placeholder="Acrylic Painting" {...register('title')} />
          <Textarea label="Description" rows={2} {...register('description')} />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createArea.isPending || updateArea.isPending}>
              {editing ? 'Save' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Expertise"
        message={`Delete "${deleting?.title}"?`}
        isLoading={deleteArea.isPending}
      />
    </div>
  )
}
