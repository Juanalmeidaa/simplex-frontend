'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TransactionDialog } from './TransactionDialog'

export function QuickActions() {
  const [dialogType, setDialogType] = useState<'income' | 'expense'>('income')
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <div className="flex gap-3 mb-6">
        <Button 
          onClick={() => {
            setDialogType('income')
            setDialogOpen(true)
          }}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Receita
        </Button>
        
        <Button 
          onClick={() => {
            setDialogType('expense')
            setDialogOpen(true)
          }}
          variant="destructive"
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Despesa
        </Button>
      </div>

      <TransactionDialog
        type={dialogType}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
