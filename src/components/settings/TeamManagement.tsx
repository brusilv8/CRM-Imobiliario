import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, MoreVertical, Shield, User, Users } from 'lucide-react';
import { useUsuarios, useUpdateUsuarioRole } from '@/hooks/useUsuarios';
import { InviteUserModal } from '@/components/settings/InviteUserModal';
import { Skeleton } from '@/components/ui/skeleton';
import type { Usuario } from '@/types/database.types';

const roleConfig = {
  admin: { label: 'Admin', icon: Shield, variant: 'default' as const, color: 'text-primary' },
  corretor: { label: 'Corretor', icon: User, variant: 'secondary' as const, color: 'text-secondary' },
  assistente: { label: 'Assistente', icon: Users, variant: 'outline' as const, color: 'text-muted-foreground' },
};

export function TeamManagement() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { data: usuarios, isLoading } = useUsuarios();
  const updateRole = useUpdateUsuarioRole();

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'corretor' | 'assistente') => {
    await updateRole.mutateAsync({ userId, role: newRole });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>Gerencie os membros e permissões da sua equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Membros da Equipe</CardTitle>
              <CardDescription>
                Gerencie os membros e permissões da sua equipe ({usuarios?.length || 0} membros)
              </CardDescription>
            </div>
            <Button onClick={() => setIsInviteOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Convidar Membro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios && usuarios.length > 0 ? (
                  usuarios.map((usuario) => {
                    const role = usuario.role || 'assistente';
                    const roleInfo = roleConfig[role as keyof typeof roleConfig];
                    const RoleIcon = roleInfo.icon;
                    
                    // Validações de segurança para todos os campos
                    const nomeUsuario = typeof usuario.nome === 'string' && usuario.nome.trim() !== '' 
                      ? usuario.nome 
                      : 'Usuário';
                    const emailUsuario = typeof usuario.email === 'string' ? usuario.email : '-';
                    const telefoneUsuario = typeof usuario.telefone === 'string' && usuario.telefone.trim() !== '' 
                      ? usuario.telefone 
                      : null;
                    const cargoUsuario = typeof usuario.cargo === 'string' && usuario.cargo.trim() !== '' 
                      ? usuario.cargo 
                      : '-';
                    const iniciais = nomeUsuario.substring(0, 2).toUpperCase();

                    return (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {iniciais}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{nomeUsuario}</p>
                              {telefoneUsuario && (
                                <p className="text-sm text-muted-foreground">{telefoneUsuario}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{emailUsuario}</TableCell>
                        <TableCell>{cargoUsuario}</TableCell>
                        <TableCell>
                          <Badge variant={roleInfo.variant} className="gap-1">
                            <RoleIcon className={`w-3 h-3 ${roleInfo.color}`} />
                            {roleInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.ativo ? 'default' : 'secondary'}>
                            {usuario.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(usuario.id, 'admin')}
                                disabled={role === 'admin'}
                              >
                                <Shield className="mr-2 w-4 h-4" />
                                Tornar Admin
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(usuario.id, 'corretor')}
                                disabled={role === 'corretor'}
                              >
                                <User className="mr-2 w-4 h-4" />
                                Tornar Corretor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleRoleChange(usuario.id, 'assistente')}
                                disabled={role === 'assistente'}
                              >
                                <Users className="mr-2 w-4 h-4" />
                                Tornar Assistente
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhum membro na equipe
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <InviteUserModal open={isInviteOpen} onOpenChange={setIsInviteOpen} />
    </>
  );
}
