import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { deleteUser as apiDeleteUser  } from "../api/userApi";

interface DeleteUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: any; // { userId, username, email }
  onDeleted?: (id: number) => void;
}

export default function DeleteUserDialog({
  open,
  onClose,
  user,
  onDeleted,
}: DeleteUserDialogProps) {
  if (!user) return null;

  const handleDelete = async () => {
    try {
      await apiDeleteUser(user.userId);

      if (onDeleted) onDeleted(user.userId);

      toast.success("User deleted successfully!");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          "Failed to delete user. Try again."
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-border rounded-2xl p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-red-200 p-3 rounded-full">
            <AlertTriangle className="h-10 w-10 text-red-600" />
          </div>

          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-red-600">
              Confirm Delete
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-center">
            Are you sure you want to delete{" "}
            <span className="font-medium">{user.username}</span>?
          </p>

          {/* <p className="text-xs text-muted-foreground">{user.email}</p> */}

          <DialogFooter className="flex w-full justify-between pt-4">
            <Button variant="outline" onClick={onClose} className="w-[45%]">
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              className="w-[45%] flex gap-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
