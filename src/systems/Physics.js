// ─── Physics System ────────────────────────────────────────────
export class Physics {
    constructor() {
        this.gravity = 600;
        this.floorY = 190;
        this.ceilY = 10;
    }

    update(dt, player, obstacles, platforms, gravityZones, ghosts) {
        // Apply gravity zones
        let gravMult = 1;
        let sideForce = 0;
        let chaotic = false;

        for (const zone of gravityZones) {
            if (!zone.active) continue;
            if (this.aabb(player.box, zone.box)) {
                switch (zone.type) {
                    case 'heavy': gravMult = 2.5; break;
                    case 'low': gravMult = 0.3; break;
                    case 'sideways': sideForce = zone.dir * 120; break;
                    case 'chaotic': chaotic = true; break;
                }
            }
        }

        if (chaotic && Math.random() < 0.03) {
            player.gravityDir *= -1;
        }

        // Apply gravity
        player.vy += this.gravity * player.gravityDir * gravMult * dt;
        player.vx += sideForce * dt;
        player.y += player.vy * dt;

        // Floor/ceiling collision
        player.grounded = false;
        if (player.gravityDir === 1) {
            if (player.y + player.h >= this.floorY) {
                player.y = this.floorY - player.h;
                player.vy = 0;
                player.grounded = true;
            }
            if (player.y <= this.ceilY) {
                player.y = this.ceilY;
                player.vy = 0;
            }
        } else {
            if (player.y <= this.ceilY) {
                player.y = this.ceilY;
                player.vy = 0;
                player.grounded = true;
            }
            if (player.y + player.h >= this.floorY) {
                player.y = this.floorY - player.h;
                player.vy = 0;
            }
        }

        // Platform collision
        for (const plat of platforms) {
            if (!plat.active) continue;
            const pb = plat.box;
            const box = player.box;

            if (this.aabb(box, pb)) {
                if (player.gravityDir === 1) {
                    // Landing on top
                    if (player.vy > 0 && box.y + box.h - player.vy * dt <= pb.y + 2) {
                        player.y = pb.y - player.h;
                        player.vy = 0;
                        player.grounded = true;
                    }
                } else {
                    // Landing on bottom (flipped)
                    if (player.vy < 0 && box.y - player.vy * dt >= pb.y + pb.h - 2) {
                        player.y = pb.y + pb.h;
                        player.vy = 0;
                        player.grounded = true;
                    }
                }
            }
        }

        // Obstacle collision → death
        for (const obs of obstacles) {
            if (!obs.active) continue;
            if (this.aabb(player.box, obs.box)) {
                return 'dead';
            }
        }

        // Ghost collision → death
        for (const ghost of ghosts) {
            if (!ghost.active) continue;
            if (this.aabb(player.box, ghost.box)) {
                return 'dead';
            }
        }

        // Off screen death
        if (player.y > this.floorY + 50 || player.y < this.ceilY - 50) {
            return 'dead';
        }

        return 'alive';
    }

    aabb(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x &&
            a.y < b.y + b.h && a.y + a.h > b.y;
    }
}
