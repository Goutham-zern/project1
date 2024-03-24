'use client'

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '~/core/ui/Dialog';
import Button from '~/core/ui/Button';

export default function AboutUsPage({ router }: { router: any }) {
  const [dialogOpen, setDialogOpen] = useState(true);

  // Function to close the dialog and redirect back to previous page
  const handleCloseDialog = () => {
    setDialogOpen(false);
    router.back(); // Redirect back to previous page
  };

  return (
    <div>
      <h1>About Us</h1>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} >
        <DialogTitle>About Us</DialogTitle>
        <DialogContent>
          <DialogDescription>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
              pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
              culpa qui officia deserunt mollit anim id est laborum.
            </p>
          </DialogDescription>

        </DialogContent>
        <Button onClick={handleCloseDialog}>Close</Button>

      </Dialog>
    </div>
  );
}
