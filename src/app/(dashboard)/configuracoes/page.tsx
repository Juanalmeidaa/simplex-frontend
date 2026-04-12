"use client";

import { useState } from "react";
import { useAuthStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Bell, Shield, Palette, Save } from "lucide-react";

export default function ConfiguracoesPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Configurações</h2>
        <p className="text-muted-foreground">Gerencie suas preferências</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil
            </CardTitle>
            <CardDescription>
              Atualize suas informações pessoais
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </CardContent>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como você recebe alertas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de Gastos</p>
                <p className="text-sm text-muted-foreground">
                  Receba notificações de gastos elevados
                </p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Resumo Mensal</p>
                <p className="text-sm text-muted-foreground">
                  Receba um resumo do seu mês por email
                </p>
              </div>
              <input type="checkbox" defaultChecked className="toggle" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Lembretes de Conta</p>
                <p className="text-sm text-muted-foreground">
                  Alertas para contas a vencer
                </p>
              </div>
              <input type="checkbox" className="toggle" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Gerencie sua segurança e privacidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Autenticação em Dois Fatores
            </Button>
            <Button variant="outline" className="w-full justify-start text-destructive">
              Exportar Meus Dados
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a aparência do app
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tema</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  className="rounded-lg border-2 border-primary p-4 text-sm font-medium"
                >
                  Claro
                </button>
                <button
                  type="button"
                  className="rounded-lg border p-4 text-sm font-medium"
                >
                  Escuro
                </button>
                <button
                  type="button"
                  className="rounded-lg border p-4 text-sm font-medium"
                >
                  Sistema
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Moeda</label>
              <select className="w-full rounded-md border p-2">
                <option value="BRL">Real Brasileiro (R$)</option>
                <option value="USD">Dólar Americano ($)</option>
                <option value="EUR">Euro (€)</option>
              </select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
