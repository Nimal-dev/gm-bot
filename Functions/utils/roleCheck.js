/**
 * Utility function to check if a member has any of the allowed roles.
 * @param {GuildMember} member - The Discord guild member object.
 * @param {string[]} allowedRoles - Array of role names allowed.
 * @returns {boolean} - True if member has any allowed role, false otherwise.
 */
function hasAllowedRole(member, allowedRoles) {
    if (!member || !member.roles) return false;
    const memberRoles = member.roles.cache.map(role => role.name);
    return allowedRoles.some(role => memberRoles.includes(role));
}

module.exports = { hasAllowedRole };
