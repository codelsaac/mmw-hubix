"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { DataGrid, type Column, SelectColumn, type SortColumn, textEditor } from 'react-data-grid';
// Use any for editor props to avoid version-specific type issues

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
import { AddUserForm } from "./add-user-form";
type RoleValue = 'ADMIN' | 'HELPER' | 'GUEST'

interface UserForGrid {
  id: string
  name?: string | null
  email?: string | null
  role: RoleValue
  department?: string | null
  emailVerified?: string | null
  image?: string | null
  isActive?: boolean
  lastLoginAt?: string | null
}

const ROLE_OPTIONS: RoleValue[] = ['ADMIN', 'HELPER', 'GUEST']

function RoleEditor({ row, onRowChange, onClose }: any) {
  return (
    <select
      autoFocus
      className="rdg-editor"
      value={row.role}
      onChange={(e) => onRowChange({ ...row, role: e.target.value as RoleValue }, true)}
      onBlur={() => onClose(true)}
    >
      {ROLE_OPTIONS.map(r => (
        <option key={r} value={r}>{r}</option>
      ))}
    </select>
  )
}

const columns: Column<UserForGrid>[] = [
  SelectColumn,
  { key: 'id', name: 'ID', width: 120, frozen: true, sortable: true },
  { key: 'name', name: 'Name', renderEditCell: textEditor as any, editable: true, sortable: true },
  { key: 'email', name: 'Email', renderEditCell: textEditor as any, editable: true, sortable: true },
  { key: 'role', name: 'Role', renderEditCell: RoleEditor as any, editable: true, sortable: true },
  { key: 'department', name: 'Department', renderEditCell: textEditor as any, editable: true, sortable: true },
  { key: 'isActive', name: 'Active', sortable: true },
  { key: 'lastLoginAt', name: 'Last Login', sortable: true }
];


export function UserManagement() {
  const [users, setUsers] = useState<UserForGrid[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(new Set());
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);
  const [history, setHistory] = useState<UserForGrid[][]>([]);
  const [redoStack, setRedoStack] = useState<UserForGrid[][]>([]);
  const [bulkRole, setBulkRole] = useState<RoleValue | "">("");
  // Column filters
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleValue | "">("");

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/admin/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data: any[] = await response.json();
        const formattedUsers: UserForGrid[] = data.map((user: any) => ({
          id: user.id,
          name: user.name ?? null,
          email: user.email ?? null,
          role: user.role as RoleValue,
          department: user.department ?? null,
          image: user.image ?? null,
          emailVerified: user.emailVerified ? new Date(user.emailVerified).toISOString() : null,
          isActive: user.isActive ?? true,
          lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : null
        }));
        setUsers(formattedUsers);
      } catch (error) {
        console.error(error);
        // Handle error (e.g., show a toast message)
      }
    }

    fetchUsers();
  }, []);

  function pushHistory(snapshot: UserForGrid[]) {
    setHistory(prev => [...prev, snapshot.map(u => ({ ...u }))])
    setRedoStack([])
  }

  function computeDisplayedRows(base: UserForGrid[]) {
    const filtered = base.filter((user) => {
      const name = (user.name ?? '').toLowerCase();
      const email = (user.email ?? '').toLowerCase();
      const q = searchQuery.toLowerCase();
      const matchesSearch = name.includes(q) || email.includes(q);
      const matchesName = name.includes(nameFilter.toLowerCase());
      const matchesEmail = email.includes(emailFilter.toLowerCase());
      const matchesRole = roleFilter ? user.role === roleFilter : true;
      return matchesSearch && matchesName && matchesEmail && matchesRole;
    });
    return sortRows(filtered, sortColumns)
  }

  function sortRows(rows: UserForGrid[], sortCols: readonly SortColumn[]) {
    if (sortCols.length === 0) return rows;
    const sorted = [...rows];
    sorted.sort((a, b) => {
      for (const sort of sortCols) {
        const { columnKey, direction } = sort;
        const aVal = (a as any)[columnKey];
        const bVal = (b as any)[columnKey];
        let cmp = 0;
        if (aVal == null && bVal != null) cmp = -1;
        else if (aVal != null && bVal == null) cmp = 1;
        else if (aVal == null && bVal == null) cmp = 0;
        else if (typeof aVal === 'number' && typeof bVal === 'number') cmp = aVal - bVal;
        else cmp = String(aVal).localeCompare(String(bVal));
        if (cmp !== 0) return direction === 'ASC' ? cmp : -cmp;
      }
      return 0;
    });
    return sorted;
  }

  async function handleRowsChange(rows: UserForGrid[], { indexes }: { indexes: readonly number[] }) {
    // Compute previous displayed rows snapshot for diffing
    const prevDisplayed = computeDisplayedRows(users);

    // Build updates from changed indexes
    const updates: Array<Partial<UserForGrid> & { id: string }> = [];
    for (const i of indexes) {
      const updated = rows[i];
      const prev = prevDisplayed[i];
      if (!updated || !prev) continue;
      const diff: any = { id: updated.id };
      if (updated.name !== prev.name) diff.name = updated.name;
      if (updated.email !== prev.email) diff.email = updated.email;
      if (updated.role !== prev.role) diff.role = updated.role;
      if (updated.department !== prev.department) diff.department = updated.department;
      if (typeof updated.isActive === 'boolean' && updated.isActive !== prev.isActive) diff.isActive = updated.isActive;
      if (Object.keys(diff).length > 1) updates.push(diff);
    }

    if (updates.length === 0) {
      // No meaningful changes
      return;
    }

    // Push history and update local state for only the changed rows by id
    const prevSnapshot = users;
    pushHistory(prevSnapshot);
    setUsers(prev => {
      const map = new Map(prev.map(u => [u.id, { ...u }]));
      for (const u of updates) {
        const current = map.get(u.id);
        if (!current) continue;
        map.set(u.id, { ...current, ...u });
      }
      return prev.map(u => map.get(u.id) as UserForGrid);
    });

    try {
      const response = await fetch(`/api/admin/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error('Failed to update users');
    } catch (error) {
      console.error(error);
      // Revert on error
      setUsers(prevSnapshot);
    }
  }

  const filteredUsers = useMemo(() => users.filter((user) => {
    const name = (user.name ?? '').toLowerCase();
    const email = (user.email ?? '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = name.includes(q) || email.includes(q);
    const matchesName = name.includes(nameFilter.toLowerCase());
    const matchesEmail = email.includes(emailFilter.toLowerCase());
    const matchesRole = roleFilter ? user.role === roleFilter : true;
    return matchesSearch && matchesName && matchesEmail && matchesRole;
  }), [users, searchQuery, nameFilter, emailFilter, roleFilter]);

  const sortedUsers = useMemo(() => sortRows(filteredUsers, sortColumns), [filteredUsers, sortColumns]);


  async function handleBulkDelete() {
    if (selectedRows.size === 0) return;
    const ids = Array.from(selectedRows);
    const prevSnapshot = users;
    pushHistory(prevSnapshot);
    // Optimistic update
    setUsers(prev => prev.filter(u => !selectedRows.has(u.id)));
    setSelectedRows(new Set());
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) throw new Error('Failed to delete users');
    } catch (e) {
      console.error(e);
      // Revert on error
      setUsers(prevSnapshot);
    }
  }

  async function handleBulkRoleUpdate() {
    if (!bulkRole || selectedRows.size === 0) return;
    const ids = Array.from(selectedRows);
    const updates = ids.map(id => ({ id, role: bulkRole as RoleValue }));
    const prevSnapshot = users;
    pushHistory(prevSnapshot);
    // Optimistic update
    setUsers(prev => prev.map(u => ids.includes(u.id) ? { ...u, role: bulkRole as RoleValue } : u));
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to apply bulk role update');
    } catch (e) {
      console.error(e);
      setUsers(prevSnapshot);
    }
  }

  function handleUndo() {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      const newPrev = [...prev];
      const snapshot = newPrev.pop()!;
      setRedoStack(r => [...r, users.map(u => ({ ...u }))]);
      setUsers(snapshot);
      return newPrev;
    });
  }

  function handleAddUserSuccess(newUser: any) {
    const formattedUser: UserForGrid = {
      id: newUser.id,
      name: newUser.name ?? null,
      email: newUser.email ?? null,
      role: newUser.role as RoleValue,
      department: newUser.department ?? null,
      image: newUser.image ?? null,
      emailVerified: newUser.emailVerified ? new Date(newUser.emailVerified).toISOString() : null,
      isActive: newUser.isActive ?? true,
      lastLoginAt: newUser.lastLoginAt ? new Date(newUser.lastLoginAt).toISOString() : null
    };
    setUsers(prev => [...prev, formattedUser]);
    setIsDialogOpen(false);
  }

  function handleRedo() {
    setRedoStack(prev => {
      if (prev.length === 0) return prev;
      const newPrev = [...prev];
      const snapshot = newPrev.pop()!;
      setHistory(h => [...h, users.map(u => ({ ...u }))]);
      setUsers(snapshot);
      return newPrev;
    });
  }


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
            <AddUserForm onSuccess={handleAddUserSuccess} />
          </DialogContent>
        </Dialog>

      {/* Filters */}
      </div>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleUndo} disabled={history.length === 0}>Undo</Button>
          <Button variant="outline" onClick={handleRedo} disabled={redoStack.length === 0}>Redo</Button>
        </div>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-2 py-2 text-sm"
            value={bulkRole}
            onChange={(e) => setBulkRole(e.target.value as RoleValue | "")}
          >
            <option value="">Select role…</option>
            {ROLE_OPTIONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <Button onClick={handleBulkRoleUpdate} disabled={!bulkRole || selectedRows.size === 0}>Apply Role</Button>
          <Button variant="destructive" onClick={handleBulkDelete} disabled={selectedRows.size === 0}>Bulk Delete</Button>
        </div>
      </div>

      {/* Column Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Input placeholder="Filter by name" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} />
        <Input placeholder="Filter by email" value={emailFilter} onChange={(e) => setEmailFilter(e.target.value)} />
        <select
          className="border rounded px-2 py-2 text-sm"
          value={roleFilter}
          onChange={(e) => setRoleFilter((e.target.value || '') as RoleValue | '')}
        >
          <option value="">All Roles</option>
          {ROLE_OPTIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
            <DataGrid 
                columns={columns}
                rows={sortedUsers}
                rowKeyGetter={(row: UserForGrid) => row.id}
                selectedRows={selectedRows}
                onSelectedRowsChange={setSelectedRows}
                sortColumns={sortColumns}
                onSortColumnsChange={setSortColumns}
                className="rdg-light"
                onRowsChange={handleRowsChange}
            />
        </CardContent>
      </Card>
    </div>
  );
}
