import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'
import { Textarea } from "@/components/ui/textarea"
import { Card } from '@/components/kanban'
import { AlignLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateCard } from '@/actions/card-actions'

interface IProps {
  cardData: Card
}

function CardDescription({ cardData }: IProps) {

  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState(cardData?.description)

  const handleSaveDescription = () => {
    console.log("Saved description:", description)
    setIsEditingDescription(false)
    updateCard(cardData.id, { description })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlignLeft className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Description</h3>
        </div>
        {!isEditingDescription && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsEditingDescription(true)}
          >
            Edit
          </Button>
        )}
      </div>

      {isEditingDescription ? (
        <div className="space-y-3">
          <Textarea
            autoFocus
            value={description || ""}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
            placeholder="Add a more detailed description..."
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveDescription}>
              Save
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => {
                setDescription(cardData.description)
                setIsEditingDescription(false)
              }}
            >
              Cancel
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Supports Markdown formatting
          </p>
        </div>
      ) : (
        <div 
          className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-md border bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-hr:my-4"
          onClick={() => setIsEditingDescription(true)}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {description || "*Click to add description*"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}

export default CardDescription