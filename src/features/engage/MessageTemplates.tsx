
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { messageTemplates } from "@/lib/placeholder-data";

export function MessageTemplates() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button>
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
          {messageTemplates.map((template) => (
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
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
