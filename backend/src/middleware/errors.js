export function notFound(req,_res,next){ const error=new Error(`Route not found: ${req.method} ${req.originalUrl}`); error.status=404; next(error); }
export function errorHandler(err,_req,res,_next){
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'A record with the same unique value already exists.' });
  const status=err.status || 500;
  res.status(status).json({ message: status===500?'Internal server error.':err.message, ...(err.details?{details:err.details}:{}) });
}
