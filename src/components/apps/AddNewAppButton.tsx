import Dialog from '@/components/ui/Dialog';
import { useApps } from '@/hooks/useApps';
import useDialog from '@/hooks/useDialog';

import Loading from '../icons/Loading';
import Button, { type ButtonProps } from '../ui/Button';
import AddNewAppForm from './AddNewAppForm';

const AddNewAppButton = (props: ButtonProps) => {
  const {
    createdAppState: { isCreatingApp }
  } = useApps();
  const { showElement: isNewAppDialogOpen, showDialog, hideDialog, shouldRender } = useDialog();

  return (
    <>
      <Button
        onClick={() => showDialog()}
        disabled={isCreatingApp}
        icon={isCreatingApp ? <Loading className="size-5 text-white" /> : null}
        {...props}
      >
        Add App
      </Button>

      <Dialog
        title="Add Landing Page"
        isOpen={isNewAppDialogOpen}
        onHide={hideDialog}
        shouldRender={shouldRender}
      >
        <AddNewAppForm />
      </Dialog>
    </>
  );
};

export default AddNewAppButton;
