"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminPanel() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3001/v1/leads")
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          setLeads(data.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background p-8 font-sans">
      <Card className="max-w-6xl mx-auto border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Lead Yönetimi (CRM)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Yükleniyor...</p>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Tarih</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Tür</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Detaylar</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-muted/30">
                      <TableCell className="font-medium whitespace-nowrap">
                        {format(new Date(lead.created_at), "dd MMM HH:mm")}
                      </TableCell>
                      <TableCell>{lead.tracking_id}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="uppercase text-[10px]">
                          {lead.insurance_category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold border-primary text-primary">
                          {lead.insurance_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {JSON.stringify(lead.dynamic_fields)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={lead.status === "NEW" ? "default" : "secondary"}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {leads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        Henüz kayıt bulunmuyor.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
