import React from 'react';
import TeamMemberRow from './TeamMemberRow.jsx';
import { useFieldArray, useForm } from 'react-hook-form';

const emptyMember = { name: '', nickname: '', jerseyNo: 0 };

const TeamForm = () => {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      members: [emptyMember],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
      <form className="team-form" onSubmit={handleSubmit(onSubmit)}>
        {fields.map((field, index) => (
            <TeamMemberRow key={field.id}
                           register={register}
                           fieldKey={`members.${index}`}
                           onRemove={() => remove(index)} />
        ))}
        {/*<input {...} placeholder="Email" />*/}
        {/*<button type="button" onClick={() => remove(index)}>*/}
        {/*  Remove*/}
        {/*</button>*/}

        <div className="team-form-actions">
          <button className="btn btn-secondary" type="button"
                  onClick={() => append(emptyMember)}>
            Añadir jugador
          </button>
        </div>

        {/*<button className="btn btn-primary" type="submit">Submit</button>*/}
      </form>
  );
};

export default TeamForm;
