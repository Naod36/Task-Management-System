import { useState } from "react";
import api from "../services/api";
import { Edit, Save, Trash, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface User {
  id: number;
  name: string;
  email?: string;
  role: "ADMIN" | "MEMBER";
}

interface UsersSectionProps {
  users: User[];
  fetchUsers: () => void;
}

export default function UsersSection({ users, fetchUsers }: UsersSectionProps) {
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [roleEdit, setRoleEdit] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const saveRole = async (userId: number) => {
    try {
      await api.put(`/users/${userId}`, { role: roleEdit });
      setEditingUserId(null);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role", err);
      alert("Failed to update role");
    }
  };

  const deleteUser = async (userId: number) => {
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
      alert("Failed to delete user");
    }
  };

  return (
    <div>
      {/* Title */}

      <div className="flex flex-col gap-2 p-4 bg-neutral-700/40 rounded-xl shadow-md">
        <h3 className="text-xl font-bold ">Users</h3>
        <hr className="border-neutral-600 my-4" />

        {users.map((user) => (
          <div
            key={user.id}
            className="bg-neutral-900 p-3 rounded-xl shadow flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{user.name}</h3>
              <p className="text-neutral-400 text-sm">{user.email}</p>
            </div>

            <div className="flex items-center gap-2">
              {editingUserId === user.id ? (
                <>
                  <select
                    className="bg-neutral-300 text-neutral-900 p-1 rounded-lg "
                    value={roleEdit}
                    onChange={(e) =>
                      setRoleEdit(e.target.value as "ADMIN" | "MEMBER")
                    }
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <button
                    className="px-4 py-1 text-neutral-900 bg-neutral-100 rounded flex flex-row gap-2 items-center hover:bg-neutral-300 hover:shadow-xl hover:scale-110 transition-all"
                    onClick={() => saveRole(user.id)}
                  >
                    <Save size={18} />
                    Save
                  </button>
                  <button
                    className="px-4 py-1 bg-red-500 hover:bg-red-400 rounded hover:scale-110 transition-all"
                    onClick={() => setEditingUserId(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm px-2 py-1 text-neutral-900 font-bold bg-neutral-200 rounded-xl">
                    {user.role}
                  </span>
                  <button
                    className="px-2 py-2  rounded hover:bg-neutral-800"
                    onClick={() => {
                      setEditingUserId(user.id);
                      setRoleEdit(user.role);
                    }}
                    title="Edit role"
                  >
                    {" "}
                    <Edit size={18} />
                  </button>
                  <button
                    className="px-2 py-2 rounded hover:bg-neutral-800 hover:text-red-400"
                    onClick={() => {
                      setSelectedUserId(user.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        <div className="flex flex-col bg-neutral-700/0   h-[60px] overflow-y-auto"></div>
        {showDeleteModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="bg-neutral-900 p-6 rounded-xl shadow-xl w-100 border border-neutral-700"
            >
              {" "}
              <h3 className="text-lg font-bold mb-2 text-red-400">
                Delete User
              </h3>
              <p className="text-neutral-300 mb-2">
                Are you sure you want to delete this user?
              </p>
              <p className="text-neutral-500 text-xs mb-4">
                This action is irreversible
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold"
                  onClick={async () => {
                    if (selectedUserId) {
                      await deleteUser(selectedUserId);
                    }
                    setShowDeleteModal(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
