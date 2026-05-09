"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Edit, Trash, PowerOff } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { offersApi } from "../api/offers-api";
import { Offer } from "../types/offers";

interface OfferDetailsActionsProps {
  offer: Offer;
}

export default function OfferDetailsActions({ offer }: OfferDetailsActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const id = offer.id || offer._id;

  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await offersApi.delete(id);
      toast.success("Offer deleted successfully");
      setShowDeleteDialog(false);
      router.push("/dashboard/offers");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete offer");
      setIsDeleting(false);
    }
  };

  const handleInactivate = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      await offersApi.update(id, { status: "inactive" });
      toast.success("Offer set to inactive");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update offer");
    } finally {
      setIsUpdating(false);
    }
  };

  const showEditDelete = (offer.redemptionCount || 0) <= 0;
  const showInactive = (offer.pendingCount || 0) <= 0 && offer.status !== "inactive";

  return (
    <>
      {showEditDelete && (
        <>
          <Link
            href={`/dashboard/offers/${id}`}
            className={cn(buttonVariants({ variant: "outline" }), "h-9 gap-2")}
          >
            <Edit className="h-4 w-4" />
            <span>Edit Offer</span>
          </Link>
          <Button
            variant="destructive"
            className="h-9 gap-2"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </>
      )}
      {showInactive && (
        <Button
          variant="outline"
          className="h-9 gap-2"
          onClick={handleInactivate}
          disabled={isUpdating}
        >
          <PowerOff className="h-4 w-4" />
          <span>Inactivate</span>
        </Button>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the offer "{offer.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
