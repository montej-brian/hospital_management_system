const MedicalRecord = require('../models/MedicalRecord');

const auditMiddleware = (action, resource) => {
    return async (req, res, next) => {
        const originalSend = res.send;
        
        res.send = function (data) {
            // Log only if successful
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const userId = req.user ? req.user.id : null;
                const resourceId = req.params.id || null;
                
                MedicalRecord.logAudit({
                    user_id: userId,
                    action: action,
                    resource: resource,
                    resource_id: resourceId
                }).catch(err => console.error('Audit Log Error:', err));
            }
            originalSend.apply(res, arguments);
        };
        next();
    };
};

module.exports = auditMiddleware;
