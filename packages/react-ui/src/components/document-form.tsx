import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { trpc } from '../lib/trpc'
import { createDocumentSchema, type Document, type CreateDocument } from '@krag/zod-schema'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

interface DocumentFormProps {
  document?: Document | null
  onClose: () => void
  onSuccess: () => void
}

const statusOptions = ['Done', 'In Process', 'Not Started']
const typeOptions = ['Narrative', 'Technical content', 'Plain language', 'Table of contents', 'Cover page']

export function DocumentForm({ document, onClose, onSuccess }: DocumentFormProps) {
  const isEditing = !!document

  const createMutation = trpc.documents.create.useMutation({
    onSuccess: () => {
      onSuccess()
    },
  })

  const updateMutation = trpc.documents.update.useMutation({
    onSuccess: () => {
      onSuccess()
    },
  })

  const form = useForm({
    defaultValues: {
      header: document?.header || '',
      type: document?.type || '',
      status: document?.status || '',
      target: document?.target || 0,
      limit: document?.limit || 0,
      reviewer: document?.reviewer || '',
    } as CreateDocument,
    onSubmit: async ({ value }) => {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: document.id,
          ...value,
        })
      } else {
        await createMutation.mutateAsync(value)
      }
    },
    validatorAdapter: zodValidator(),
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Document' : 'Create Document'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the document details.' : 'Add a new document to the list.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          {/* Header */}
          <form.Field
            name="header"
            validators={{
              onChange: createDocumentSchema.shape.header,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="header">Header</Label>
                <Input
                  id="header"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Document header"
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <form.Field
              name="type"
              validators={{
                onChange: createDocumentSchema.shape.type,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Status */}
            <form.Field
              name="status"
              validators={{
                onChange: createDocumentSchema.shape.status,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Target */}
            <form.Field
              name="target"
              validators={{
                onChange: createDocumentSchema.shape.target,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    placeholder="0"
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Limit */}
            <form.Field
              name="limit"
              validators={{
                onChange: createDocumentSchema.shape.limit,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="limit">Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    placeholder="0"
                  />
                  {field.state.meta.errors?.length > 0 && (
                    <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>
          </div>

          {/* Reviewer */}
          <form.Field
            name="reviewer"
            validators={{
              onChange: createDocumentSchema.shape.reviewer,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="reviewer">Reviewer</Label>
                <Input
                  id="reviewer"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Reviewer name"
                />
                {field.state.meta.errors?.length > 0 && (
                  <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
