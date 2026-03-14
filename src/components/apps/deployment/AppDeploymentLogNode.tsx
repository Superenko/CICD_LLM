import type { HTMLAttributes } from 'react';

import type { GithubWorkflowJobStep } from '@/types/github';

import AppDeploymentLogNodeIcon from './AppDeploymentLogNodeIcon';

interface AppDeploymentLogNodeProps extends HTMLAttributes<HTMLLIElement> {
  logNode: GithubWorkflowJobStep;
}

const AppDeploymentLogNode = ({ logNode, ...props }: AppDeploymentLogNodeProps) => (
  <li {...props}>
    <div className="relative pb-8">
      <span className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />

      <div className="relative flex items-start space-x-3">
        <div className="relative">
          <div className="relative px-1">
            <AppDeploymentLogNodeIcon status={logNode.status} conclusion={logNode.conclusion} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mt-1 flex items-center justify-between gap-x-4 text-sm">
            <span className="font-medium text-gray-900">{logNode.name}</span>

            {logNode.completed_at && (
              <time
                dateTime={logNode.completed_at}
                className="flex-none py-0.5 text-xs leading-5 text-gray-500"
              >
                {logNode.completed_at}
              </time>
            )}
          </div>

          {/* <div className="mt-2 text-sm text-gray-700">
            <ul role="list" className="space-y-6">
              {logNode?.details?.map((item) => (
                <AppDeploymentLogItem
                  key={`${logNode.name}-${item.data.message}-${item.data.timestamp}`}
                  logItem={item}
                />
              ))}
            </ul>
          </div> */}
        </div>
      </div>
    </div>
  </li>
);

export default AppDeploymentLogNode;
