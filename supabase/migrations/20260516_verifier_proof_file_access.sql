drop policy if exists "Quest verifiers can view assigned proof files"
on storage.objects;

create policy "Quest verifiers can view assigned proof files"
on storage.objects for select
to authenticated
using (
  bucket_id = 'quest-proofs'
  and exists (
    select 1
    from public.proof_submissions ps
    where ps.file_url = storage.objects.name
      and ps.reviewer_id = auth.uid()
      and ps.status = 'pending'
  )
);
