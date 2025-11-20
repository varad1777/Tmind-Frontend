import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createDevice } from "@/api/deviceApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddAsset() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ParentAsset: "",
  });

  const [loading, setLoading] = useState(false);

  // Full Form Validation 
  const validateForm = () => {
    const { name, description,ParentAsset } = formData;
    const trimmedName = name.trim();

    const nameRegex = /^[A-Za-z][A-Za-z0-9_\- ]{2,99}$/;
    if (!trimmedName) {
      toast.error("Device Name is required.");
      return false;
    }
    if (!nameRegex.test(trimmedName)) {
      toast.error(
        "Device Name must start with a letter, be 3–100 characters long, and may contain letters, numbers, spaces, underscores, or hyphens (but not start with a hyphen)."
      );
      return false;
    }

    if (description && description.length > 255) {
      toast.error("Description must be less than 255 characters.");
      return false;
    }

    return true;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        parentAsset: formData.ParentAsset,
    
      };

      const response = await createDevice(payload);
      console.log("Asset created:", response);

      toast.success(`Asset "${payload.name}" Added successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });

      setTimeout(() => navigate("/Assets"), 1000);
    } catch (err: any) {
      console.error("Error creating Assets:", err);

      // Extract backend message
      const backendMessage =
        err?.response?.data?.error || 
        err?.response?.data?.message || 
        err?.response?.data?.data?.message ||
        "Failed to Add Asset. Please try again.";

      toast.error(backendMessage, {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    } 
    finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-background text-foreground transition-colors duration-300">
      <Card className="w-full max-w-xl shadow-lg border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-center">
            Add New Asset
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Asset Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Device Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter Asset name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">parent asset Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Parent Asset name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/Assets")}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Device"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
