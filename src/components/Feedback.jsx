export function Feedback({ error, success }) {
  return (
    <>
      {error && <p className="feedback feedback-error" role="alert">{error}</p>}
      {success && <p className="feedback feedback-success" role="status">{success}</p>}
    </>
  )
}
