import { toast } from 'react-toastify';

import { supabase } from '@/config/supabase';
import { githubRepository } from '@/services/github/github-repository/service';
import { GithubRepository } from '@/services/github/github-repository/types';
import { TimesheetProject } from '@/services/timesheet/timesheet-project/types';

export const timesheetProject: TimesheetProject.Service = {
  entity: 'TimesheetProject',
  async set(
    input: TimesheetProject.Input
  ): Promise<TimesheetProject.Row[] | undefined> {
    const repositories = await githubRepository.get(input.repository);

    if (!repositories || repositories.length === 0) {
      toast.error('Repositório inválido');

      return [];
    }

    const repository = repositories[0].id;

    const exists = await this.get(repository);

    let response;

    if (exists && exists.length > 0) {
      response = await supabase
        .from(this.entity)
        .update({
          clientCode: input.client.code,
          clientName: input.client.name,
          projectCode: input.project.code,
          projectName: input.project.name,
        })
        .eq('repository', repository)
        .select();
    } else {
      response = await supabase
        .from(this.entity)
        .insert({
          repository,
          clientCode: input.client.code,
          clientName: input.client.name,
          projectCode: input.project.code,
          projectName: input.project.name,
        })
        .select();
    }

    const { data, error } = response;

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
  async get(
    repository: GithubRepository.Row['id']
  ): Promise<TimesheetProject.Row[] | undefined> {
    const { data, error } = await supabase
      .from(this.entity)
      .select()
      .eq('repository', repository);

    if (error) {
      return void toast.error(JSON.stringify(error));
    }

    return data;
  },
};
