
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  PlusCircle,
  Languages,
  Paperclip,
  Trash2,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { messageTemplates as initialMessageTemplates } from "@/lib/placeholder-data";
import { TemplateFormDialog } from "./TemplateFormDialog";
import { useToast } from "@/hooks/use-toast";

export type Template = typeof initialMessageTemplates[0];

export function MessageTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = React.useState<Template[]>(initialMessageTemplates);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [editingTemplate, setEditingTemplate] = React.useState<Template | undefined>(undefined);

  const handleOpenDialog = (mode: "add" | "edit", template?: Template) => {
    setDialogMode(mode);
    setEditingTemplate(template);
    setDialogOpen(true);
  };

  const handleSaveTemplate = (templateData: Omit<Template, "id">) => {
    if (dialogMode === "add") {
      const newTemplate = { ...templateData, id: `tpl_${Date.now()}` };
      setTemplates((prev) => [newTemplate, ...prev]);
      toast({ title: "Template Added", description: `${newTemplate.name} has been created.` });
    } else if (editingTemplate) {
      const updatedTemplate = { ...editingTemplate, ...templateData };
      setTemplates((prev) => prev.map((t) => (t.id === editingTemplate.id ? updatedTemplate : t)));
      toast({ title: "Template Updated", description: `${updatedTemplate.name} has been updated.` });
    }
  };

  const handleDelete = (templateId: string) => {
     const templateName = templates.find((t) => t.id === templateId)?.name || "The template";
     setTemplates((prev) => prev.filter((t) => t.id !== templateId));
     toast({
      title: "Template Deleted",
      description: `${templateName} has been removed.`,
    });
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => handleOpenDialog("add")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create Template
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Template Name</TableHead>
              <TableHead>Content (English)</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Attachments</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell className="font-medium">{template.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {template.contentEn}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    <Languages className="mr-1 h-3 w-3" />
                    {template.contentUr ? "2" : "1"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {template.attachments.length > 0 ? (
                    <Badge>
                      <Paperclip className="mr-1 h-3 w-3" />
                      {template.attachments.length}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">None</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenDialog('edit', template)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(template.id)}
                        className="text-red-600 focus:bg-red-50 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <TemplateFormDialog
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </>
  );
}
