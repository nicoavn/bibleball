import React, { useEffect } from 'react';
import TeamMemberRow from './TeamMemberRow.jsx';
import { useFieldArray, useForm } from 'react-hook-form';
import { useAppContext } from '../../Providers.jsx';
import { EmptyMember } from '../../constants.js';

const TeamForm = ({ teamIndex }) => {
  const { appState, setAppState } = useAppContext();

  const { register, control, watch } = useForm({
    defaultValues: {
      ...(appState.forms.newGameForm.teams[teamIndex] ?? {
        members: [EmptyMember],
      }),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  });

  const teamName = watch('name');
  const teamMembers = watch('members');

  useEffect(() => {
    setAppState((prevState) => {
      const existingTeam = {
        ...(prevState.forms.newGameForm.teams[teamIndex] ?? {}),
      };

      existingTeam.name = teamName;
      existingTeam.members = teamMembers;

      const teams = [...prevState.forms.newGameForm.teams];
      teams[teamIndex] = existingTeam;

      return {
        ...prevState,
        forms: {
          ...prevState.forms,
          newGameForm: {
            ...prevState.forms.newGameForm,
            teams: teams,
          },
        },
      };
    });
  }, [setAppState, teamIndex, teamMembers, teamName]);

  return (
    <form className="form team-form" onSubmit={(ev) => ev.preventDefault()}>
      <div className="fieldset">
        <input placeholder="Nombre Equipo" type="text" {...register('name')} required />
      </div>
      {fields.map((field, index) => (
        <TeamMemberRow
          key={field.id}
          register={register}
          fieldKey={`members.${index}`}
          onRemove={() => remove(index)}
        />
      ))}

      <div className="team-form-actions">
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => append(emptyMember)}
        >
          Añadir jugador
        </button>
      </div>
    </form>
  );
};

export default TeamForm;
