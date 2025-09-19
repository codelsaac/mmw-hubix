"use client"

import type React from "react"

import { useState, useEffect } from "react"
import DataGrid, { type Column } from 'react-data-grid';
import { textEditor } from 'react-data-grid/editors';
import 'react-data-grid/lib/styles.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, UserPlus } from "lucide-react";
import type { User } from '@prisma/client';

const mockUsers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@school.edu",
    role: "admin",
    status: "active",
    joinDate: "2023-09-01",
    lastLogin: "2024-01-15",
    avatar: "/professional-woman-diverse.png",
    specialties: ["Network Management", "Security"],
  },
  {
    id: 2,
    name: "Marcus Johnson",
    email: "marcus.johnson@school.edu",
    role: "admin",
    status: "active",
    joinDate: "2023-09-01",
    lastLogin: "2024-01-14",
    avatar: "/professional-man.png",
    specialties: ["Hardware Support", "Training"],
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@school.edu",
    role: "prefect",
    status: "active",
    joinDate: "2023-10-15",
    lastLogin: "2024-01-15",
    avatar: "/professional-woman-tech.png",
    specialties: ["Software Support", "Documentation"],
  },
  {
    id: 4,
    name: "David Kim",
    email: "david.kim@school.edu",
    role: "prefect",
    status: "active",
    joinDate: "2023-11-01",
    lastLogin: "2024-01-13",
    avatar: "/professional-man-tech.png",
    specialties: ["Database Management", "Web Development"],
  },
  {
    id: 5,
    name: "Alex Thompson",
    email: "alex.thompson@school.edu",
    role: "prefect",
    status: "pending",
    joinDate: "2024-01-10",
    lastLogin: "Never",
    avatar: "/young-professional.png",
    specialties: ["User Support", "Mobile Devices"],
  },
]

type UserForGrid = Omit<User, 'password' | 'emailVerified'> & { emailVerified: string | null };


const columns: Column<UserForGrid>[] = [
  { key: 'id', name: 'ID' },
  { key: 'name', name: 'Name' },
  { key: 'email', name: 'Email', editor: textEditor },
  { key: 'role', name: 'Role', editor: textEditor },
  { key: 'createdAt', name: 'Join Date' },
  { key: 'updatedAt', name: 'Last Update' },
];


export function UserManagement() {
  const [users, setUsers] = useState<UserForGrid[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data: User[] = await response.json();
        const formattedUsers = data.map(user => ({
            ...user,
            emailVerified: user.emailVerified ? user.emailVerified.toISOString() : null
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error(error);
        // Handle error (e.g., show a toast message)
      }
    }

    fetchUsers();
  }, []);

  async function handleRowsChange(rows: UserForGrid[], { indexes }: { indexes: readonly number[] }) {
    const updatedUser = rows[indexes[0]];
    const oldUser = users[indexes[0]];

    if (updatedUser === oldUser) return;

    setUsers(rows);

    try {
        const response = await fetch(`/api/admin/users/${updatedUser.id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update user');
        }

    } catch (error) {
        console.error(error);
        // Revert the change in the UI
        const revertedRows = [...users];
        revertedRows[indexes[0]] = oldUser;
        setUsers(revertedRows);
    }
  }


  const filteredUsers = users.filter((user) => {
    const name = user.name ?? '';
    const email = user.email ?? '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">User Management</h2>
          <p className="text-muted-foreground">Manage IT Prefect team members and their roles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsDialogOpen(true);
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            {/* Add user form will go here */}
            Add user functionality to be implemented.
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
            <DataGrid 
                columns={columns} 
                rows={filteredUsers} 
                className="rdg-light" 
                onRowsChange={handleRowsChange}
            />
        </CardContent>
      </Card>
    </div>
  );
}
