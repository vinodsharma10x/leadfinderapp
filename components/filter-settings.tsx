"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { FilterConfig } from "@/lib/types"

interface FilterSettingsProps {
  config: FilterConfig
  onConfigChange: (config: FilterConfig) => void
}

export default function FilterSettings({ config, onConfigChange }: FilterSettingsProps) {
  const [newKeyword, setNewKeyword] = useState("")

  const handleToggleEmptyFields = () => {
    onConfigChange({
      ...config,
      excludeEmptyFields: !config.excludeEmptyFields,
    })
  }

  const handleAddKeyword = () => {
    if (newKeyword && !config.excludedKeywords.includes(newKeyword.toLowerCase())) {
      onConfigChange({
        ...config,
        excludedKeywords: [...config.excludedKeywords, newKeyword.toLowerCase()],
      })
      setNewKeyword("")
    }
  }

  const handleRemoveKeyword = (keyword: string) => {
    onConfigChange({
      ...config,
      excludedKeywords: config.excludedKeywords.filter((k) => k !== keyword),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="exclude-empty" checked={config.excludeEmptyFields} onCheckedChange={handleToggleEmptyFields} />
        <Label htmlFor="exclude-empty">Exclude records with empty fields</Label>
      </div>

      <div className="space-y-2">
        <Label>Excluded Keywords</Label>
        <p className="text-sm text-muted-foreground mb-2">
          Records containing these keywords in name, address, or workplace will be excluded
        </p>
        <div className="flex space-x-2">
          <Input
            placeholder="Add keyword..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddKeyword()
              }
            }}
          />
          <Button onClick={handleAddKeyword} type="button">
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {config.excludedKeywords.map((keyword) => (
            <div
              key={keyword}
              className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center gap-1"
            >
              {keyword}
              <button
                onClick={() => handleRemoveKeyword(keyword)}
                className="text-secondary-foreground/70 hover:text-secondary-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
