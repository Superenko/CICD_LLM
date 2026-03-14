import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';

import { MAX_SELECTED_VALUES } from '@/constants/misc';
import { useApps } from '@/hooks/useApps';

import Loading from '../icons/Loading';
import Button from '../ui/Button';
import Label from '../ui/Label';
import Select from '../ui/Select';

const AddNewAppForm = () => {
  const navigate = useNavigate();

  const {
    fetchModels,
    createApp,
    createdAppState: { createAppError: error },
    modelsState: {
      modelsData: { models: availableModelNames },
      isModelsLoading
    }
  } = useApps();

  const [modelNames, setModelNames] = useState<string[]>([]);
  const [isProcessingAllRequests, setIsProcessingAllRequests] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessingAllRequests(true);

    try {
      const createdApps = await Promise.all(modelNames.map((name) => createApp(name)));
      const failedApps = createdApps.filter((app) => !app);

      if (failedApps.length > 0) {
        toast.error(`Failed to create ${failedApps.length} app(s).`);
        return;
      }

      if (createdApps.length === 1) {
        navigate(`/${createdApps[0]?.project_name}`);
      } else {
        window.location.reload();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create apps.';
      toast.error(errorMessage);
    } finally {
      setIsProcessingAllRequests(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="mb-3 text-red-600">
          <div className="font-medium">Whoops! Something went wrong.</div>
          <p className="mt-1.5 text-sm">{error}</p>
        </div>
      )}

      <p className="mb-3">
        Please, select up to {MAX_SELECTED_VALUES} models names whose pages you want to deploy.
      </p>

      <div>
        <Label htmlFor="modelName" required>
          Model name
        </Label>

        <Select
          id="modelName"
          className="mt-1 block w-full"
          selectedValues={modelNames}
          onSelectedValuesChange={setModelNames}
          onChange={(e) => setModelNames([e.target.value])}
          options={availableModelNames.map((model) => model.name) ?? []}
          placeholder="Search models..."
          isLoading={isModelsLoading}
          isAutocomplete
          isMultiSelect
          required
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="submit"
          disabled={!modelNames.length || isProcessingAllRequests}
          icon={isProcessingAllRequests ? <Loading className="size-5 text-white" /> : null}
        >
          Create
        </Button>
      </div>
    </form>
  );
};

export default AddNewAppForm;
